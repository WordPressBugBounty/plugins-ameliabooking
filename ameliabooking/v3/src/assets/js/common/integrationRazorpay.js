import httpClient from '@/plugins/axios'
import {
  useCreateBookingSuccess,
  useCreateBookingError,
  getErrorMessage,
} from '@/assets/js/public/booking.js'

const STATUS_CHECK_FAILED = 'error'

/**
 * Persist deferred-gateway booking ids into sessionStorage before redirect/checkout.
 *
 * @param {object} response
 * @param {{ includeName?: boolean }} [options]
 */
export function storeDeferredGatewayCache(response, options = {}) {
  const saved = sessionStorage.getItem('ameliaCacheData')
  if (!saved || saved === 'null') {
    return
  }

  const ameliaCacheData = JSON.parse(saved)
  if (!ameliaCacheData) {
    return
  }

  ameliaCacheData.bookings = response.data.data.bookings
  ameliaCacheData.packageCustomer = response.data.data.packageCustomer

  if (options.includeName || response.data.data.name) {
    ameliaCacheData.name = response.data.data.name
  }

  sessionStorage.setItem('ameliaCacheData', JSON.stringify(ameliaCacheData))
}

/**
 * @param {object} response
 */
export function storeRazorpayCache(response) {
  storeDeferredGatewayCache(response, { includeName: true })
}

/**
 * @param {number|string} id
 * @param {string} type
 * @param {string} token
 * @returns {Promise<boolean|'error'>}
 */
async function isRemotelyPendingBooking(id, type, token) {
  try {
    const response = await httpClient.post('/bookings/delete/remotely/' + id, {
      skipEventHandler: true,
      type,
      token,
      statusOnly: true,
    })

    return response?.data?.data?.pending === true
  } catch (e) {
    console.log(e.message)
    return STATUS_CHECK_FAILED
  }
}

/**
 * @param {number|string} id
 * @param {string} type
 * @param {string} token
 * @returns {Promise<boolean|'error'>} true when deleted, false when confirmed non-pending, 'error' on failure
 */
async function deleteRemotelyIfPending(id, type, token) {
  const pending = await isRemotelyPendingBooking(id, type, token)
  if (pending === STATUS_CHECK_FAILED) {
    return STATUS_CHECK_FAILED
  }

  if (!pending) {
    return false
  }

  try {
    await httpClient.post('/bookings/delete/remotely/' + id, {
      skipEventHandler: true,
      type,
      token,
    })
    return true
  } catch (e) {
    console.log(e.message)
    return STATUS_CHECK_FAILED
  }
}

/**
 * Delete only bookings that are still pending on the server after Razorpay dismiss.
 * Clears session cache only when every booking is confirmed non-pending or deleted.
 *
 * @returns {Promise<boolean>}
 */
export async function deletePendingRazorpayBookings() {
  const savedData = sessionStorage.getItem('ameliaCacheData')
  if (!savedData || savedData === 'null') {
    return false
  }

  try {
    const data = JSON.parse(savedData)
    let deletedPending = false
    let requestFailed = false

    if (data.packageCustomer) {
      const result = await deleteRemotelyIfPending(
        data.packageCustomer.id,
        'package',
        data.packageCustomer.token,
      )
      if (result === STATUS_CHECK_FAILED) {
        requestFailed = true
      } else if (result === true) {
        deletedPending = true
      }
    } else if (data.bookings) {
      for (const booking of data.bookings) {
        const result = await deleteRemotelyIfPending(booking.id, data.type, booking.token)
        if (result === STATUS_CHECK_FAILED) {
          requestFailed = true
          break
        }
        if (result === true) {
          deletedPending = true
        }
      }
    }

    if (!requestFailed) {
      sessionStorage.removeItem('ameliaCacheData')
    }

    return !requestFailed && deletedPending
  } catch (e) {
    console.log(e.message)
    return false
  }
}

/**
 * Finalize Razorpay checkout via notify callback.
 *
 * @param {object} store
 * @param {string} paymentId
 * @param {string} signature
 * @param {string} orderId
 * @param {string} cacheName
 * @param {{ onSuccess: Function, onError: Function }} callbacks
 */
export function razorpayVerify(store, paymentId, signature, orderId, cacheName, callbacks) {
  httpClient
    .post('/payment/razorpay/notify', {
      name: cacheName,
      paymentId: paymentId,
      signature: signature,
      orderId: orderId,
    })
    .then((response) => {
      sessionStorage.removeItem('ameliaCacheData')
      useCreateBookingSuccess(store, response, () => {
        callbacks.onSuccess(response)
      })
    })
    .catch((error) => {
      useCreateBookingError(store, error.response ? error.response.data : {}, () => {
        callbacks.onError(getErrorMessage())
      })
    })
}
