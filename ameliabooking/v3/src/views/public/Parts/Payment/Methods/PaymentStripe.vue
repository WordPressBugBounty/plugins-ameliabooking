<template>
  <div class="am-fs__payment-stripe" :style="cssVars">
    <div v-if="stripeElementsLoading" class="am-fs__payment-stripe__skeleton" aria-busy="true">
      <p class="am-fs__payment-stripe__skeleton-label">
        {{ labels.payment_loading_methods || 'Loading payment methods...' }}
      </p>
      <div class="am-fs__payment-stripe__skeleton-bar" />
      <div class="am-fs__payment-stripe__skeleton-bar am-fs__payment-stripe__skeleton-bar--short" />
    </div>

    <div v-if="supportsExpressCheckout" class="am-fs__payment-stripe__express-checkout">
      <div :id="'am-stripe-event-express-' + shortcode.counter" class="am-stripe-express"></div>
    </div>

    <div v-if="expressCheckoutAvailable" class="am-fs__payment-divider">
      <span class="am-divider-text">{{ labels.payment_or_pay_with_card }}</span>
    </div>

    <div class="am-fs__payment-stripe__payment-element">
      <div :id="'am-stripe-event-pe-' + shortcode.counter" class="am-stripe-pe"></div>
    </div>

    <div class="am-fs__payment-stripe__policy">
      <p>{{ labels.payment_protected_policy }}</p>
      <img
        :src="baseUrls.wpAmeliaPluginURL + '/v3/src/assets/img/icons/stripe.svg'"
        alt="Stripe policy"
      />
      <span>{{ labels.stripe }}</span>
    </div>

    <div
      v-if="settingsValue.general.googleRecaptcha.enabled"
      :id="'recaptcha-' + shortcode.counter"
      class="am-recaptcha-holder"
    >
      <vue-recaptcha
        ref="recaptchaRef"
        :size="settingsValue.general.googleRecaptcha.invisible ? 'invisible' : null"
        :load-recaptcha-script="true"
        :sitekey="settingsValue.general.googleRecaptcha.siteKey"
        @render="onRecaptchaRender"
        @verify="onRecaptchaVerify"
        @expired="onRecaptchaExpired"
      />
    </div>
  </div>
</template>

<script setup>
/* global Stripe */
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
} from 'vue'
import { useStore } from 'vuex'
import { VueRecaptcha } from 'vue-recaptcha'

import {
  getBookingErrorResponse,
  getErrorMessage,
  useBookingData,
  useCreateBookingError,
  useCreateBookingSuccess,
} from '../../../../../assets/js/public/booking.js'
import { useColorTransparency } from '../../../../../assets/js/common/colorManipulation.js'
import { useScrollTo } from '../../../../../assets/js/common/scrollElements'
import httpClient from '../../../../../plugins/axios'
import {
  bindStripePaymentElementChange,
  buildStripeIntentCacheKey,
  cancelActiveStripePaymentIntent,
  clearStripePendingPayment,
  createStripePaymentElementOptions,
  invalidateStripePaymentIntentRequest,
  persistStripePendingPayment,
  pollStripePaymentCompletion,
  requestStripePaymentIntent,
  setActiveStripeCacheName,
  setStripePaymentCompleted,
  waitForStripeCleanup,
} from '../../../../../assets/js/public/stripePaymentIntent.js'

const store = useStore()
const injectedSettings = inject('settings')
const injectedLabels = inject('amLabels')
const localLanguage = inject('localLanguage')
const baseUrls = inject('baseUrls')
const shortcodeData = inject('shortcodeData')
const amColors = inject('amColors')
const amFonts = inject('amFonts')
const stepsArray = inject('stepsArray')

const { nextStep, footerButtonReset, footerButtonClicked } = inject('changingStepsFunctions', {
  nextStep: () => {},
  footerButtonReset: () => {},
  footerButtonClicked: {
    value: false,
  },
})

const emits = defineEmits(['payment-error'])

let recaptchaRef = ref(null)
let recaptchaValid = ref(false)
let recaptchaResponse = ref(null)
let recaptchaWidgetReady = ref(false)

// Why the current token was requested, so onRecaptchaVerify knows whether to
// create the payment intent or to confirm the payment: 'init' | 'pay' | 'express'
let recaptchaPurpose = null
let pendingRecaptchaPurpose = null

let stripeClient = null
let paymentElements = null
let paymentElement = null
let expressCheckoutElement = null
let intentData = null
let pendingIntentCacheName = null
let stripeInitVersion = 0

let supportsExpressCheckout = ref(false)
let expressCheckoutAvailable = ref(false)
let stripeElementsLoading = ref(false)
let paymentCompleted = ref(false)
let paymentInProgress = ref(false)
let selectedPaymentMethodType = ref(null)
let stripeInitialized = ref(false)

function getStripeInstanceId() {
  return shortcode.value.counter
}

const settingsValue = computed(
  () => injectedSettings?.value || injectedSettings || store.getters['getSettings'],
)
const labels = computed(() => injectedLabels?.value || injectedLabels || {})
const shortcode = computed(() => shortcodeData?.value || shortcodeData || {})
const stripeLocale = computed(() => (localLanguage?.value || localLanguage || '').replace('_', '-'))

function recaptchaEnabled() {
  return settingsValue.value.general.googleRecaptcha.enabled
}

function recaptchaInvisible() {
  return settingsValue.value.general.googleRecaptcha.invisible
}

// The widget id only exists once the reCAPTCHA script has loaded and rendered,
// which happens after this component mounts, so a request made before that is
// queued and replayed from onRecaptchaRender.
function requestRecaptchaToken(purpose) {
  if (!recaptchaWidgetReady.value) {
    pendingRecaptchaPurpose = purpose
    return true
  }

  return executeRecaptcha(purpose)
}

function executeRecaptcha(purpose) {
  if (!recaptchaRef.value || typeof recaptchaRef.value.execute !== 'function') {
    return failRecaptchaRequest()
  }

  recaptchaPurpose = purpose

  try {
    // The previous token is single use, so it has to be cleared first.
    recaptchaRef.value.reset()
    recaptchaRef.value.execute()
  } catch (e) {
    recaptchaPurpose = null
    return failRecaptchaRequest()
  }

  return true
}

// Without a token the intent cannot be created, so drop the loading skeleton
// instead of leaving it up over an element that will never mount.
function failRecaptchaRequest() {
  recaptchaValid.value = false
  stripeElementsLoading.value = false
  emits('payment-error', labels.value.recaptcha_error)
  store.commit('setLoading', false)

  return false
}

function onRecaptchaRender() {
  recaptchaWidgetReady.value = true

  if (pendingRecaptchaPurpose) {
    const purpose = pendingRecaptchaPurpose
    pendingRecaptchaPurpose = null
    executeRecaptcha(purpose)
  }
}

function getFormData() {
  return {
    shortcode: shortcode.value,
    steps: stepsArray.value.map((i) => i.name),
  }
}

function buildBookingData(paymentData = {}, recaptcha = null) {
  return useBookingData(store, getFormData(), false, paymentData, recaptcha)
}

function createStripeClient(connectAccountId) {
  const options = {
    locale: stripeLocale.value,
  }

  if (connectAccountId) {
    options.stripeAccount = connectAccountId
  }

  return Stripe(
    settingsValue.value.payments.stripe.testMode === false
      ? settingsValue.value.payments.stripe.livePublishableKey
      : settingsValue.value.payments.stripe.testPublishableKey,
    options,
  )
}

function preloadStripeClient(connectAccountId = null) {
  if (typeof Stripe !== 'function') {
    return null
  }

  return createStripeClient(connectAccountId)
}

function getStripeIntentCacheKey() {
  const coupon = store.getters['coupon/getCoupon'] || {}

  return buildStripeIntentCacheKey({
    couponDiscount: coupon.discount,
    couponDeduction: coupon.deduction,
    deposit: store.getters['payment/getPaymentDeposit'],
    counter: shortcode.value.counter,
  })
}

function resetStripeState() {
  try {
    expressCheckoutElement?.unmount()
  } catch (e) {
    // Stripe may already have detached the element during re-initialization.
  }

  try {
    paymentElement?.unmount()
  } catch (e) {
    // Stripe may already have detached the element during re-initialization.
  }

  expressCheckoutElement = null
  paymentElement = null
  paymentElements = null
  stripeClient = null
  intentData = null
  supportsExpressCheckout.value = false
  expressCheckoutAvailable.value = false
  selectedPaymentMethodType.value = null
}

function hasExpressPaymentMethods(availablePaymentMethods) {
  if (!availablePaymentMethods || typeof availablePaymentMethods !== 'object') {
    return false
  }

  return Object.keys(availablePaymentMethods).some((key) => !!availablePaymentMethods[key])
}

function stripePaymentReadyForBooking(paymentIntent) {
  return paymentIntent && ['succeeded', 'requires_capture'].includes(paymentIntent.status)
}

async function cancelPendingStripePayment() {
  if (paymentCompleted.value) {
    return
  }

  pendingIntentCacheName = null
  await cancelActiveStripePaymentIntent(getStripeInstanceId())
}

async function handleStripePaymentFailure(message) {
  paymentInProgress.value = false
  clearStripePendingPayment()

  try {
    await cancelPendingStripePayment()
    await reinitializeStripePayment()
    emits('payment-error', message)
  } finally {
    store.commit('setLoading', false)
  }
}

async function initializeStripePayment() {
  if (paymentInProgress.value) {
    return
  }

  await waitForStripeCleanup(getStripeInstanceId())
  const initVersion = ++stripeInitVersion
  stripeElementsLoading.value = true
  resetStripeState()

  try {
    const bookingData = buildBookingData({}, recaptchaResponse.value)
    bookingData.data.returnUrl = window.location.href

    const intentRequest = requestStripePaymentIntent(
      getStripeInstanceId(),
      getStripeIntentCacheKey(),
      bookingData.data,
      bookingData.options,
    )

    const preloadedClient = preloadStripeClient()
    const response = await intentRequest

    if (initVersion !== stripeInitVersion) {
      return
    }

    intentData = response.data.data
    pendingIntentCacheName = intentData?.cacheName || null
    setActiveStripeCacheName(getStripeInstanceId(), pendingIntentCacheName)
    stripeInitialized.value = true

    if (!intentData?.clientSecret) {
      stripeElementsLoading.value = false
      return
    }

    stripeClient =
      preloadedClient && !intentData.connectAccountId
        ? preloadedClient
        : createStripeClient(intentData.connectAccountId)
    paymentElements = stripeClient.elements({
      clientSecret: intentData.clientSecret,
      locale: stripeLocale.value,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: amColors.value.colorPrimary || '#1A84EE',
          colorText: amColors.value.colorInpText || '#1A2C37',
          colorBackground: amColors.value.colorInpBgr || '#FFFFFF',
          borderRadius: '6px',
          fontFamily: amFonts.value.fontFamily,
        },
      },
    })

    supportsExpressCheckout.value = true
    paymentElement = paymentElements.create(
      'payment',
      createStripePaymentElementOptions({
        billingDetails: {
          name: (
            (store.getters['customerInfo/getCustomerFirstName'] || '') +
            ' ' +
            (store.getters['customerInfo/getCustomerLastName'] || '')
          ).trim(),
          email: store.getters['customerInfo/getCustomerEmail'] || '',
        },
        includeAddress: !!settingsValue.value.payments.stripe.address,
      }),
    )

    expressCheckoutElement = paymentElements.create('expressCheckout', {
      layout: {
        maxColumns: 1,
        overflow: 'never',
      },
    })

    await nextTick()

    if (initVersion !== stripeInitVersion) {
      return
    }

    const peTarget = document.getElementById('am-stripe-event-pe-' + shortcode.value.counter)
    if (peTarget) {
      paymentElement.mount('#am-stripe-event-pe-' + shortcode.value.counter)
    }

    bindStripePaymentElementChange(
      paymentElement,
      initVersion,
      () => stripeInitVersion,
      (type) => {
        selectedPaymentMethodType.value = type
      },
    )

    const expressTarget = document.getElementById(
      'am-stripe-event-express-' + shortcode.value.counter,
    )
    if (expressTarget) {
      expressCheckoutElement.mount('#am-stripe-event-express-' + shortcode.value.counter)
    }

    stripeElementsLoading.value = false

    expressCheckoutElement.on('ready', function (event) {
      if (initVersion !== stripeInitVersion) {
        return
      }

      expressCheckoutAvailable.value = hasExpressPaymentMethods(event.availablePaymentMethods)
      supportsExpressCheckout.value = expressCheckoutAvailable.value
    })

    expressCheckoutElement.on('click', function (event) {
      event.resolve()
    })

    expressCheckoutElement.on('confirm', function () {
      continueWithStripePayment(true)
    })
  } catch (e) {
    if (initVersion !== stripeInitVersion) {
      return
    }

    stripeElementsLoading.value = false
    resetStripeState()
    errorBooking(e)
  }
}

// Every path that re-creates the intent has to come through here: the token that
// verified the previous intent is already consumed, so invisible mode needs a
// fresh one before re-initializing.
async function reinitializeStripePayment() {
  invalidateStripePaymentIntentRequest(getStripeInstanceId())
  // The old intent is gone from here on, so nothing may confirm against it while
  // the replacement is being created.
  stripeInitialized.value = false
  await nextTick()

  if (recaptchaEnabled() && recaptchaInvisible()) {
    stripeElementsLoading.value = true
    requestRecaptchaToken('init')
    return
  }

  await initializeStripePayment()
}

async function completeStripePayment(paymentIntentId, cacheName) {
  try {
    const response = await httpClient.post('/payment/stripe/complete', {
      name: cacheName,
      paymentIntentId,
      recaptcha: recaptchaResponse.value,
    })

    successBooking(response)
  } catch (error) {
    errorBooking(error)
  }
}

async function confirmStripePayment(isExpressCheckout = false) {
  if (!stripeClient || !paymentElements || !intentData) {
    emits('payment-error', 'Payment not initialized')
    store.commit('setLoading', false)
    return
  }

  const completionCacheName = intentData.cacheName
  const completionReturnUrl = intentData.returnUrl

  if (!completionCacheName) {
    emits('payment-error', 'Payment not initialized')
    store.commit('setLoading', false)
    return
  }

  paymentInProgress.value = true
  store.commit('setLoading', true)
  emits('payment-error', '')

  if (!isExpressCheckout) {
    const { error: submitError } = await paymentElements.submit()

    if (submitError) {
      paymentInProgress.value = false
      const fallbackMessage =
        selectedPaymentMethodType.value && selectedPaymentMethodType.value !== 'card'
          ? 'Please complete the selected payment method'
          : 'Please complete the payment form'
      emits('payment-error', submitError.message || fallbackMessage)
      store.commit('setLoading', false)
      return
    }
  }

  // Persist the form snapshot before confirming, since redirect-based methods
  // (bank redirects, full-page 3DS) navigate away from the page. This lets the
  // form restore to the payment step if the customer returns via browser back.
  const pendingBookingData = buildBookingData({}, recaptchaResponse.value)

  persistStripePendingPayment({
    componentProps: pendingBookingData.componentProps,
    paymentIntentId: null,
    cacheName: completionCacheName,
    bookableType: store.getters['bookableType/getType'],
  })

  try {
    const { error, paymentIntent } = await stripeClient.confirmPayment({
      elements: paymentElements,
      confirmParams: {
        return_url: completionReturnUrl,
      },
      redirect: 'if_required',
    })

    if (error) {
      await handleStripePaymentFailure(error.message || 'Payment failed')
      return
    }

    if (!paymentIntent) {
      return
    }

    if (stripePaymentReadyForBooking(paymentIntent)) {
      await completeStripePayment(paymentIntent.id, completionCacheName)
      paymentInProgress.value = false
      return
    }

    if (paymentIntent?.status === 'processing') {
      persistStripePendingPayment({
        componentProps: pendingBookingData.componentProps,
        paymentIntentId: paymentIntent.id,
        cacheName: completionCacheName,
        bookableType: store.getters['bookableType/getType'],
      })

      paymentInProgress.value = false
      store.commit('setLoading', false)

      try {
        const response = await pollStripePaymentCompletion({
          cacheName: completionCacheName,
          paymentIntentId: paymentIntent.id,
          recaptcha: recaptchaResponse.value,
        })

        successBooking(response)
      } catch (error) {
        errorBooking(error)
      }

      return
    }

    await handleStripePaymentFailure('Payment was not completed')
  } catch (error) {
    await handleStripePaymentFailure(error?.message || 'Payment failed')
  }
}

function onRecaptchaExpired() {
  recaptchaValid.value = false
  emits('payment-error', labels.value.recaptcha_error)
}

function onRecaptchaVerify(response) {
  recaptchaValid.value = true
  recaptchaResponse.value = response

  const purpose = recaptchaPurpose
  recaptchaPurpose = null

  // The intent is created with this token; there is nothing to confirm yet. A tick
  // on the visible checkbox arrives without a purpose and has to start the
  // initialization as well, as long as there is no usable intent yet.
  if (purpose === 'init' || (!purpose && !stripeInitialized.value)) {
    initializeStripePayment()
    return
  }

  if (purpose !== 'pay' && purpose !== 'express') {
    return
  }

  const isExpressCheckout = purpose === 'express'

  // The intent has to exist before it can be confirmed: it either failed to
  // initialize or was invalidated, so rebuild it with this token and only then
  // continue with the payment the customer already asked for.
  if (!stripeInitialized.value) {
    initializeStripePayment().then(function () {
      if (stripeInitialized.value) {
        confirmStripePayment(isExpressCheckout)
      }
    })

    return
  }

  confirmStripePayment(isExpressCheckout)
}

function successBooking(response) {
  paymentCompleted.value = true
  pendingIntentCacheName = null
  clearStripePendingPayment()
  setStripePaymentCompleted(getStripeInstanceId(), true)
  setActiveStripeCacheName(getStripeInstanceId(), null)

  useCreateBookingSuccess(store, response, function () {
    nextStep()
  })
}

function errorBooking(error) {
  clearStripePendingPayment()

  useCreateBookingError(store, getBookingErrorResponse(error), () => {
    emits('payment-error', getErrorMessage())
  })
}

let paymentRef = inject('paymentRef')

function continueWithStripePayment(isExpressCheckout = false) {
  if (!recaptchaEnabled()) {
    confirmStripePayment(isExpressCheckout)
    return
  }

  if (recaptchaInvisible()) {
    // The intent was verified when it was created and /complete does not
    // re-check, so a second token here would be spent for nothing.
    if (stripeInitialized.value) {
      confirmStripePayment(isExpressCheckout)
      return
    }

    // Initialization failed earlier: get a token and rebuild the intent.
    requestRecaptchaToken(isExpressCheckout ? 'express' : 'pay')
    return
  }

  if (!recaptchaValid.value) {
    emits('payment-error', labels.value.recaptcha_error)
    store.commit('setLoading', false)
    return
  }

  confirmStripePayment(isExpressCheckout)
}

function continueWithBooking() {
  footerButtonReset()
  continueWithStripePayment(false)
}

watchEffect(
  () => {
    if (footerButtonClicked.value) {
      if (!store.getters['coupon/getCouponValidated']) {
        footerButtonReset()
        useScrollTo(paymentRef.value, paymentRef.value, 20, 300)
        emits('payment-error', labels.value.coupon_mandatory)
      } else {
        continueWithBooking()
      }
    }
  },
  { flush: 'post' },
)

watch(
  [
    () => store.getters['coupon/getCoupon'].discount,
    () => store.getters['coupon/getCoupon'].deduction,
    () => store.getters['payment/getPaymentDeposit'],
  ],
  async () => {
    if (paymentInProgress.value) {
      return
    }

    await reinitializeStripePayment()
  },
)

onMounted(() => {
  if (!recaptchaEnabled()) {
    initializeStripePayment()
    return
  }

  // Invisible badge: the intent request is reCAPTCHA-gated, so get a token first
  // and let onRecaptchaVerify start the initialization. The visible checkbox
  // waits for the customer's tick, which lands in onRecaptchaVerify too.
  if (recaptchaInvisible()) {
    stripeElementsLoading.value = true
    requestRecaptchaToken('init')
  }
})

onBeforeUnmount(async () => {
  await cancelPendingStripePayment()
})

let cssVars = computed(() => {
  return {
    '--am-c-pay-text': amColors.value.colorMainText,
    '--am-c-pay-text-op60': useColorTransparency(amColors.value.colorMainText, 0.6),
  }
})
</script>

<script>
export default {
  name: 'PaymentStripe',
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    $pay: am-fs__payment-stripe;
    .#{$pay} {
      .#{$pay}__policy {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--am-c-pay-text-op60);
        margin: 20px 0 10px;
        flex-wrap: wrap;

        p {
          display: inline-flex;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.42857;
          color: var(--am-c-ps-text);
          width: 100%;
          justify-content: center;
        }

        img {
          margin: 0 8px;
        }

        span {
          display: inline-flex;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.42857;
          color: #6772e5;
        }
      }

      &__payment-element {
        .am-stripe-pe {
          background-color: var(--am-c-inp-bgr);
          border: 1px solid var(--am-c-inp-border);
          border-radius: 6px;
          box-shadow: 0 2px 2px rgb(14 25 32 / 3%);
          box-sizing: border-box;
          padding: 12px;
        }
      }

      &__skeleton {
        background-color: var(--am-c-inp-bgr);
        border: 1px solid var(--am-c-inp-border);
        border-radius: 6px;
        padding: 12px;
      }

      &__skeleton-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--am-c-pay-text-op60);
        margin: 0 0 12px;
        text-align: center;
      }

      &__skeleton-bar {
        height: 14px;
        width: 100%;
        margin-bottom: 10px;
        border-radius: 4px;
        background-color: var(--am-c-pay-text-op60);
        opacity: 0.18;

        &--short {
          width: 60%;
          margin-bottom: 0;
        }
      }

      .am-recaptcha-holder {
        height: 84px;
        position: relative;

        & > div > div {
          position: absolute !important;
        }
      }

      .am-fs__payment-stripe__express-checkout {
        margin-bottom: 20px;

        .am-stripe-express {
          margin-bottom: 10px;
        }
      }

      .am-fs__payment-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin: 16px 0;
        text-align: center;
      }

      .am-fs__payment-divider::before,
      .am-fs__payment-divider::after {
        content: '';
        flex-grow: 1;
        height: 1px;
        background-color: var(--am-c-pay-text-op60);
        margin: 0 8px;
      }

      .am-divider-text {
        font-size: 14px;
        color: var(--am-c-pay-text-op60);
        text-transform: uppercase;
        line-height: 1.33333;
        font-weight: 500;
      }
    }
  }
}
</style>
