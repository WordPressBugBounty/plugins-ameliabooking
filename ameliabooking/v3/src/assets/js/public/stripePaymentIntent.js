import httpClient from '../../../plugins/axios'

const STRIPE_CANCEL_TIMEOUT_MS = 10000
const STRIPE_POLL_INTERVAL_MS = 3000
const STRIPE_POLL_MAX_ATTEMPTS = 40
const STRIPE_COMPLETE_TIMEOUT_MS = 2500

const stripeInstances = new Map()

// The reservation a hold belongs to has to outlive this module: a page reload wipes the map, and without
// the name the next request cannot tell the server which hold it is replacing - so the customer's own
// reservation would report the slot as taken.
const HOLD_STORAGE_KEY = 'ameliaStripeHold'

function readStoredHolds() {
  try {
    return JSON.parse(sessionStorage.getItem(HOLD_STORAGE_KEY)) || {}
  } catch (e) {
    return {}
  }
}

function writeStoredHold(instanceId, cacheName) {
  try {
    const holds = readStoredHolds()

    if (cacheName) {
      holds[String(instanceId ?? 'default')] = cacheName
    } else {
      delete holds[String(instanceId ?? 'default')]
    }

    if (Object.keys(holds).length) {
      sessionStorage.setItem(HOLD_STORAGE_KEY, JSON.stringify(holds))
    } else {
      sessionStorage.removeItem(HOLD_STORAGE_KEY)
    }
  } catch (e) {
    // Private mode or blocked storage: reuse across a reload is lost, nothing else is.
  }
}

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
      cleanupInFlight: null,
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
  writeStoredHold(instanceId, cacheName || null)
}

export function getActiveStripeCacheName(instanceId) {
  const instance = getStripeInstance(instanceId)

  if (instance.activeStripeCacheName) {
    return instance.activeStripeCacheName
  }

  // Nothing in memory means this page just loaded; a stored name is a hold from before the reload.
  const stored = readStoredHolds()[String(instanceId ?? 'default')] || null

  instance.activeStripeCacheName = stored

  return stored
}

export function setStripePaymentCompleted(instanceId, completed) {
  getStripeInstance(instanceId).paymentCompleted = !!completed

  if (completed) {
    writeStoredHold(instanceId, null)
  }
}

// Resolves to whether the server confirmed the release. It never rejects - a cancel that fails is not an
// error the customer can act on - but the caller has to be able to tell a released reservation from one
// that is still standing, so it can keep the name and try again.
export function cancelStripePaymentIntentByName(cacheName) {
  if (!cacheName) {
    return Promise.resolve(false)
  }

  return httpClient
    .post(
      '/payment/stripe/cancel',
      { name: cacheName },
      {
        timeout: STRIPE_CANCEL_TIMEOUT_MS,
      },
    )
    .then(() => true)
    .catch(() => false)
}

export function cancelActiveStripePaymentIntent(instanceId) {
  const instance = getStripeInstance(instanceId)

  if (instance.paymentCompleted) {
    return Promise.resolve()
  }

  if (instance.cancelInFlight) {
    return instance.cancelInFlight
  }

  // Read through storage, not just this module's memory: a hold taken before a page reload has to be
  // releasable even when nothing has asked for its name yet, or leaving the step would strand it until
  // the server sweeps it up half an hour later.
  const cacheName = getActiveStripeCacheName(instanceId)

  if (!cacheName) {
    return Promise.resolve()
  }

  invalidateStripePaymentIntentRequest(instanceId)

  // Only a confirmed release may forget the name. A cancel that failed or timed out leaves the hold
  // standing on the server, and forgetting it here would leave nothing able to retry the release after a
  // reload - the customer would be stuck behind their own reservation until the sweeper picks it up.
  instance.cancelInFlight = cancelStripePaymentIntentByName(cacheName)
    .then((released) => {
      if (released && instance.activeStripeCacheName === cacheName) {
        instance.activeStripeCacheName = null
        writeStoredHold(instanceId, null)
      }

      return released
    })
    .finally(() => {
      instance.cancelInFlight = null
    })

  return instance.cancelInFlight
}

export async function waitForStripeCleanup(instanceId, { keepReservation = false } = {}) {
  const instance = getStripeInstance(instanceId)
  const pendingIntent = instance.activeRequest

  // Re-initialising the same payment step keeps its hold: the intent request carries the name, and the
  // server either hands the same PaymentIntent back or replaces the reservation itself. Releasing it here
  // would delete and re-insert a booking on every visit, and would strand the customer behind their own
  // reservation whenever the cancel call failed to arrive.
  if (keepReservation) {
    if (pendingIntent) {
      try {
        // Let a request that is still in the air finish rather than invalidating it: invalidating makes
        // its response stale, and a stale response releases the reservation it just took - so a slow
        // coupon or deposit update would send the replacement request to race a cancel for the very slot
        // it is trying to hold. Completing normally keeps that reservation and stores its name, which is
        // what the replacement then sends for the server to reuse or supersede.
        await pendingIntent
      } catch (e) {
        // A request that failed holds nothing, or has already given back what it took.
      }

      return
    }

    invalidateStripePaymentIntentRequest(instanceId)

    return
  }

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

const STRIPE_POLL_TIMEOUT_FLAG = 'stripePollTimeout'

function createStripePollTimeoutError() {
  const error = new Error('Payment is still processing')
  error[STRIPE_POLL_TIMEOUT_FLAG] = true

  return error
}

/**
 * True when polling ran out of attempts while the payment was still processing.
 * The payment is not known to have failed, so any pending snapshot must be kept.
 */
export function isStripePollTimeoutError(error) {
  return !!error?.[STRIPE_POLL_TIMEOUT_FLAG]
}

/**
 * Routes a completion failure to the right handler.
 *
 * A poll that ran out of attempts is not a failed payment: the Stripe webhook still finalizes
 * it, so the pending snapshot has to be kept instead of being torn down as a confirmed
 * failure. Anything else is a real error.
 *
 * @param {Error}    error
 * @param {Function} onStillProcessing
 * @param {Function} onError
 */
export function handleStripeCompletionError(error, onStillProcessing, onError) {
  if (isStripePollTimeoutError(error)) {
    onStillProcessing()

    return
  }

  onError(error)
}

/**
 * Polls /payment/stripe/complete until the intent leaves a pending status.
 *
 * No reCAPTCHA token is sent: the request was verified before the intent was created
 * and the endpoint finalizes with paymentVerified, so it never looks at one.
 */
export async function pollStripePaymentCompletion({
  cacheName,
  paymentIntentId,
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

  throw createStripePollTimeoutError()
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
