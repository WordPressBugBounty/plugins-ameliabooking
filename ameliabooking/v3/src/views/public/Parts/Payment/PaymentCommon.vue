<template>
  <div class="am-fs__payment_default"></div>
</template>

<script setup>
import { useStore } from 'vuex'
import { inject, watchEffect } from 'vue'
import httpClient from '../../../../plugins/axios'
import {
  useBookingData,
  useCreateBookingError,
  getErrorMessage,
} from '../../../../assets/js/public/booking.js'
import {
  storeDeferredGatewayCache,
  storeRazorpayCache,
  deletePendingRazorpayBookings,
  razorpayVerify,
} from '@/assets/js/common/integrationRazorpay.js'

const store = useStore()

const emits = defineEmits(['payment-error', 'payment-abandoned'])

const shortcodeData = inject('shortcodeData')

let stepsArray = inject('stepsArray')

let sidebarSteps = inject('sidebarSteps')

/**************
 * Navigation *
 *************/

const { nextStep, footerButtonReset, footerButtonClicked } = inject('changingStepsFunctions', {
  nextStep: () => {},
  footerButtonReset: () => {},
  footerButtonClicked: {
    value: false,
  },
})

// * Labels
const amLabels = inject('amLabels')

watchEffect(() => {
  if (footerButtonClicked.value) {
    if (!store.getters['booking/getCouponValidated']) {
      footerButtonReset()
      emits('payment-error', amLabels.value.coupon_mandatory)
    } else {
      continueWithBooking()
    }
  }
})

/***********
 * Payment *
 **********/

function continueWithBooking() {
  footerButtonReset()

  let gateway = store.getters['booking/getPaymentGateway']

  let bookingData = useBookingData(
    store,
    gateway === 'mollie' || gateway === 'barion' || gateway === 'razorpay'
      ? {
          shortcode: shortcodeData.value,
          steps: stepsArray.value.map((i) => i.key),
          sidebar: sidebarSteps.value.map((i) =>
            Object.assign({ key: i.key, data: i.stepSelectedData }),
          ),
        }
      : null,
    false,
    {},
    null,
  )

  store.commit('booking/setLoading', true)

  switch (gateway) {
    case 'mollie':
      payment('/payment/mollie', bookingData, function (response) {
        storeDeferredGatewayCache(response)
        window.location = response.data.data.redirectUrl
      })

      break

    case 'razorpay':
      payment('/payment/razorpay', bookingData, function (response) {
        storeRazorpayCache(response)

        let options = response.data.data.data
        let cacheName = response.data.data.name
        let razorpayCheckoutFinalizing = false

        options.handler = function (razorpayResponse) {
          razorpayCheckoutFinalizing = true
          razorpayVerify(
            store,
            razorpayResponse.razorpay_payment_id,
            razorpayResponse.razorpay_signature,
            options.order_id,
            cacheName,
            {
              onSuccess: () => nextStep(),
              onError: (message) => emits('payment-error', message),
            },
          )
        }

        options.modal = {
          ondismiss: async function () {
            if (razorpayCheckoutFinalizing) {
              return
            }

            const deleted = await deletePendingRazorpayBookings()

            if (deleted) {
              emits('payment-abandoned')
            }
          },
        }

        let razorpay = new Razorpay(options)

        razorpay.open()
      })

      break

    case 'barion':
      payment('/payment/barion', bookingData, function (response) {
        storeDeferredGatewayCache(response)
        window.location = response.data.data.redirectUrl
      })

      break
  }
}

function payment(endpoint, bookingData, success) {
  httpClient
    .post(endpoint, bookingData.data, bookingData.options)
    .then(success)
    .catch((error) => {
      useCreateBookingError(store, error.response.data, () => {
        emits('payment-error', getErrorMessage())
      })
    })
}
</script>

<script>
export default {
  name: 'PaymentCommon',
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    .am-fs__payment_default {
      &-btn {
      }
    }
  }
}
</style>
