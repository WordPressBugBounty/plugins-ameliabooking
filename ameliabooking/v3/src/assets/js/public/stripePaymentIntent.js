import httpClient from '../../../plugins/axios'

const STRIPE_CANCEL_TIMEOUT_MS = 10000
const STRIPE_POLL_INTERVAL_MS = 3000
const STRIPE_POLL_MAX_ATTEMPTS = 40
const STRIPE_COMPLETE_TIMEOUT_MS = 2500

const stripeInstances = new Map()

function getStripeInstance(instanceId) {
  const key = String(instanceId ?? 'default')

  if (!stripeInstances.has(key)) {
    stripeInstances.set(key, {
      activeStripeCacheName: null,
      cancelInFlight: null,
      paymentCompleted: false,
      activeCacheKey: null,
      activeRequest: null,
      activeRequestId: 0,
    })
  }

  return stripeInstances.get(key)
}

export function buildStripeIntentCacheKey(parts = {}) {
  return JSON.stringify(parts)
}

export function invalidateStripePaymentIntentRequest(instanceId) {
  const instance = getStripeInstance(instanceId)

  instance.activeCacheKey = null
  instance.activeRequest = null
  instance.activeRequestId += 1
}

export function setActiveStripeCacheName(instanceId, cacheName) {
  getStripeInstance(instanceId).activeStripeCacheName = cacheName || null
}

export function getActiveStripeCacheName(instanceId) {
  return getStripeInstance(instanceId).activeStripeCacheName
}

export function setStripePaymentCompleted(instanceId, completed) {
  getStripeInstance(instanceId).paymentCompleted = !!completed
}

export function cancelStripePaymentIntentByName(cacheName) {
  if (!cacheName) {
    return Promise.resolve()
  }

  return httpClient
    .post(
      '/payment/stripe/cancel',
      { name: cacheName },
      {
        timeout: STRIPE_CANCEL_TIMEOUT_MS,
      },
    )
    .catch(() => {
      // Ignore cancel errors; the pending reservation may already be released.
    })
}

export function cancelActiveStripePaymentIntent(instanceId) {
  const instance = getStripeInstance(instanceId)

  if (instance.paymentCompleted) {
    return Promise.resolve()
  }

  if (instance.cancelInFlight) {
    return instance.cancelInFlight
  }

  const cacheName = instance.activeStripeCacheName

  if (!cacheName) {
    return Promise.resolve()
  }

  invalidateStripePaymentIntentRequest(instanceId)

  instance.cancelInFlight = cancelStripePaymentIntentByName(cacheName).finally(() => {
    if (instance.activeStripeCacheName === cacheName) {
      instance.activeStripeCacheName = null
    }

    instance.cancelInFlight = null
  })

  return instance.cancelInFlight
}

export async function waitForStripeCleanup(instanceId) {
  const instance = getStripeInstance(instanceId)
  const pendingIntent = instance.activeRequest

  invalidateStripePaymentIntentRequest(instanceId)

  if (pendingIntent) {
    try {
      const response = await pendingIntent
      await cancelStaleIntentResponse(instanceId, response)
    } catch (e) {
      // Stale in-flight intents release their reservation before rejecting.
    }
  }

  await cancelActiveStripePaymentIntent(instanceId)

  if (instance.cancelInFlight) {
    await instance.cancelInFlight
  }
}

export function prefetchStripePaymentIntent(instanceId, cacheKey, payload, options) {
  return requestStripePaymentIntent(instanceId, cacheKey, payload, options)
}

export function createStripePaymentElementOptions({ billingDetails, includeAddress = false }) {
  return {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: 'always',
      spacedAccordionItems: false,
    },
    defaultValues: {
      billingDetails,
    },
    ...(includeAddress
      ? {
          fields: {
            billingDetails: {
              address: 'auto',
            },
          },
        }
      : {}),
  }
}

export function bindStripePaymentElementChange(
  paymentElement,
  initVersion,
  getInitVersion,
  onTypeChange,
) {
  paymentElement.on('change', (event) => {
    if (initVersion !== getInitVersion()) {
      return
    }

    onTypeChange(event.value?.type || null, event)
  })
}

export function persistStripePendingPayment({
  componentProps,
  paymentIntentId,
  cacheName,
  bookableType,
}) {
  if (!componentProps) {
    return
  }

  sessionStorage.setItem(
    'ameliaCacheData',
    JSON.stringify({
      request: componentProps,
      paymentMethod: 'stripe',
      type: bookableType,
      stripePaymentIntentId: paymentIntentId,
      cacheName,
      status: 'processing',
    }),
  )
}

export function clearStripePendingPayment() {
  sessionStorage.removeItem('ameliaCacheData')
}

function isStripeCompletionPending(data) {
  if (!data) {
    return true
  }

  if (data.type) {
    return false
  }

  const pendingStatuses = [
    'processing',
    'requires_action',
    'requires_confirmation',
    'requires_source_action',
  ]

  return !!(data.status && pendingStatuses.includes(data.status))
}

export async function pollStripePaymentCompletion({
  cacheName,
  paymentIntentId,
  recaptcha = null,
  maxAttempts = STRIPE_POLL_MAX_ATTEMPTS,
  intervalMs = STRIPE_POLL_INTERVAL_MS,
}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    let response

    try {
      response = await httpClient.post(
        '/payment/stripe/complete',
        {
          name: cacheName,
          paymentIntentId,
          recaptcha,
        },
        {
          timeout: STRIPE_COMPLETE_TIMEOUT_MS,
        },
      )
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        continue
      }

      throw error
    }

    const data = response?.data?.data

    if (!isStripeCompletionPending(data)) {
      if (data?.type) {
        return response
      }

      throw new Error(data?.message || 'Payment was not completed')
    }
  }

  throw new Error('Payment is still processing')
}

async function cancelStaleIntentResponse(instanceId, response) {
  const cacheName = response?.data?.data?.cacheName

  if (!cacheName) {
    return
  }

  const instance = getStripeInstance(instanceId)

  if (instance.activeStripeCacheName === cacheName) {
    instance.activeStripeCacheName = null
  }

  await cancelStripePaymentIntentByName(cacheName)
}

export function requestStripePaymentIntent(instanceId, cacheKey, payload, options) {
  const instance = getStripeInstance(instanceId)

  if (instance.activeCacheKey === cacheKey && instance.activeRequest) {
    return instance.activeRequest
  }

  const requestId = ++instance.activeRequestId
  instance.activeCacheKey = cacheKey
  instance.activeRequest = httpClient
    .post('/payment/stripe/intent', payload, options)
    .then(async (response) => {
      if (instance.activeRequestId !== requestId || instance.activeCacheKey !== cacheKey) {
        await cancelStaleIntentResponse(instanceId, response)

        throw new Error('Stale Stripe payment intent request')
      }

      instance.activeCacheKey = null
      instance.activeRequest = null

      const cacheName = response?.data?.data?.cacheName

      if (cacheName) {
        setStripePaymentCompleted(instanceId, false)
        setActiveStripeCacheName(instanceId, cacheName)
      }

      return response
    })
    .catch((error) => {
      if (instance.activeRequestId === requestId && instance.activeCacheKey === cacheKey) {
        instance.activeCacheKey = null
        instance.activeRequest = null
      }

      throw error
    })

  return instance.activeRequest
}
