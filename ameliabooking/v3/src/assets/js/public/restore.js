import { useRemoveUrlParameter } from '../common/helper.js'
import {
  useAppointmentCalendarData,
  usePackageCalendarData,
  useEventCalendarData,
  useBookingError,
  useNotify,
} from './booking.js'
import httpClient, { useAmeliaNonce } from '../../../plugins/axios'
import { settings } from '../../../plugins/settings'

function fixType(item, key) {
  item[key] =
    item[key] === undefined || item[key] === null || item[key] === '' ? null : parseInt(item[key])
}

function fixCacheData(data) {
  let keys = []

  data.request.state.attachments = []

  data.request.state.booked = null

  data.request.state.loading = true

  data.request.state.ready = false

  if (!('extras' in data.request.state.appointment.bookings[0])) {
    data.request.state.appointment.bookings[0].extras = []
  }

  fixType(data.request.state, 'packageId')

  fixType(data.request.state, 'appointmentsIndex')

  data.request.state.appointments.forEach((a) => {
    keys = ['index', 'packageId', 'serviceId']

    keys.forEach((key) => {
      fixType(a, key)
    })

    for (let serviceId in a.services) {
      a.services[serviceId].list.forEach((i) => {
        keys = ['locationId', 'providerId']

        keys.forEach((key) => {
          fixType(i, key)
        })

        if (!('extras' in i) || i.extras === undefined || i.extras === null) {
          i.extras = []
        }
      })

      keys = ['locationId', 'providerId']

      keys.forEach((key) => {
        fixType(a.services[serviceId], key)
      })
    }
  })

  keys = ['locationId', 'providerId', 'serviceId', 'categoryId', 'packageId']

  keys.forEach((key) => {
    fixType(data.request.state.appointment, key)
  })
}

function getRestoreTargetStep(data) {
  if ('bookableType' in data.request.state && data.request.state.bookableType === 'event') {
    return 'EventPayment'
  }

  return 'paymentStep'
}

export function resolveRestoreStepIndex(steps, targetStep, fallbackStep) {
  const targetKey = targetStep || fallbackStep
  let index = steps.findIndex((step) => step.key === targetKey || step.name === targetKey)

  if (index < 0) {
    index = Math.max(0, steps.length - 2)
  }

  return index
}

function setRestoredPaymentGateway(store, data) {
  const gateway = data.paymentMethod || 'stripe'

  if ('bookableType' in data.request.state && data.request.state.bookableType === 'event') {
    store.commit('payment/setPaymentGateway', gateway)
  } else {
    store.commit('booking/setPaymentGateway', gateway)
  }
}

function useRestore(store, shortcodeData) {
  let data =
    'ameliaCache' in window && window.ameliaCache.length && window.ameliaCache[0]
      ? JSON.parse(window.ameliaCache[0])
      : null

  let userClickedBack = false

  if (
    !data ||
    (!data.status &&
      parseInt(data.request.form.shortcode.counter) !== parseInt(shortcodeData.counter))
  ) {
    let savedData = sessionStorage.getItem('ameliaCacheData')
    const navEntries = performance.getEntriesByType('navigation')
    const navType =
      navEntries && navEntries.length > 0 ? navEntries[0].type : performance.navigation.type
    if (savedData && JSON.parse(savedData) && (navType === 'back_forward' || navType === 2)) {
      data = JSON.parse(savedData)
      userClickedBack = true
    } else {
      if (savedData) {
        sessionStorage.setItem('ameliaCacheData', null)
      }
      return null
    }
  }

  sessionStorage.removeItem('ameliaCacheData')

  // The gateway redirect reloaded the page, so the nonce the booking request returned is gone.
  // The cache is localized with a nonce minted for this page load - use it for the requests below.
  useAmeliaNonce(data.wpAmeliaNonce)

  try {
    window.history.replaceState(
      null,
      null,
      useRemoveUrlParameter(
        useRemoveUrlParameter(window.location.href, 'ameliaWcCache'),
        'ameliaCache',
      ),
    )
  } catch (e) {
    console.log(e)
  }

  if (
    data.request.state.attachments &&
    (data.request.state.attachments.length || Object.keys(data.request.state.attachments).length)
  ) {
    fixCacheData(data)
  }

  if ('bookableType' in data.request.state && data.request.state.bookableType === 'event') {
    store.commit('eventEntities/setEventsDisplay', data.request.state.eventsDisplay)
    store.commit('bookableType/setType', data.request.state.bookableType)
    store.commit('pagination/setAllData', data.request.state.pagination)
    store.commit('params/setAllData', data.request.state.params)
    store.commit('eventBooking/setEventId', data.request.state.eventId)
    store.commit('coupon/setCoupon', data.request.state.coupon)
    store.commit('customFields/setAllData', data.request.state.customFields)
    store.commit('customerInfo/setAllData', data.request.state.customerInfo)
    store.commit('payment/setAllData', data.request.state.payment)
    store.commit('persons/setAllData', data.request.state.persons)
    store.commit('tickets/setAllData', data.request.state.tickets)

    // * Request because event params and pagination
    if (data.request.state.eventsDisplay === 'calendar') {
      store.dispatch('eventEntities/requestEvents', 'calendar')
      store.dispatch('eventEntities/requestEvents', 'upcoming')
    } else {
      store.dispatch('eventEntities/requestEvents')
    }
    store.dispatch('customFields/filterEventCustomFields')
  } else {
    store.state.booking = { ...data.request.state }
  }

  if (userClickedBack) {
    if (
      (data.paymentMethod === 'mollie' ||
        data.paymentMethod === 'barion' ||
        data.paymentMethod === 'razorpay') &&
      data.bookings
    ) {
      if (data.packageCustomer) {
        httpClient
          .post('/bookings/delete/remotely/' + data.packageCustomer.id, {
            skipEventHandler: true,
            type: 'package',
            token: data.packageCustomer.token,
          })
          .catch((e) => {
            console.log(e.message)
          })
      } else {
        data.bookings.forEach((booking) => {
          httpClient
            .post('/bookings/delete/remotely/' + booking.id, {
              skipEventHandler: true,
              type: data.type,
              token: booking.token,
            })
            .catch((e) => {
              console.log(e.message)
            })
        })
      }
    }

    return {
      result: 'error',
      targetStep: getRestoreTargetStep(data),
      steps: data.request.form.steps,
      sidebar: data.request.form.sidebar,
    }
  }

  if (settings.payments.mollie.cancelBooking && data.status === null) {
    let bookings = []
    if (data.response.type === 'package') {
      bookings = data.response.package.map((p) => p.booking)
    } else {
      bookings = [data.response.booking].concat(data.response.recurring.map((r) => r.booking))
    }

    bookings.forEach((booking) => {
      httpClient
        .post(
          '/bookings/cancel/remotely/' + booking.id,
          {
            confirmed: 1,
            type: data.response.type,
            fromForm: true,
          },
          {
            params: {
              token: booking.token,
              type: data.response.type,
            },
          },
        )
        .catch((e) => {
          console.log(e.message)
        })
    })

    return {
      result: 'canceled',
      targetStep: getRestoreTargetStep(data),
      steps: data.request.form.steps,
      sidebar: data.request.form.sidebar,
    }
  } else {
    switch (data.status !== null ? data.status : 'paid') {
      case 'canceled':
        if ('bookableType' in data.request.state && data.request.state.bookableType === 'event') {
          store.commit('payment/setError', window.wpAmeliaLabels['payment_canceled'])
        } else {
          store.commit('booking/setError', window.wpAmeliaLabels['payment_canceled'])
        }

        setRestoredPaymentGateway(store, data)

        return {
          result: 'canceled',
          targetStep: getRestoreTargetStep(data),
          steps: data.request.form.steps,
          sidebar: data.request.form.sidebar,
        }

      case 'failed': {
        // Cache may only have status=failed (redirect gateways), or include data from markCompletionFailed
        const failedErrorResponse =
          data.data && typeof data.data === 'object'
            ? { data: data.data }
            : { data: { paymentSuccessful: false } }

        if ('bookableType' in data.request.state && data.request.state.bookableType === 'event') {
          store.commit('payment/setError', useBookingError(failedErrorResponse, store))
        } else {
          store.commit('booking/setError', useBookingError(failedErrorResponse, store))
        }

        setRestoredPaymentGateway(store, data)

        return {
          result: 'error',
          targetStep: getRestoreTargetStep(data),
          steps: data.request.form.steps,
          sidebar: data.request.form.sidebar,
        }
      }

      case 'paid':
        switch (data.response.type) {
          case 'appointment':
            store.commit('booking/setBooked', useAppointmentCalendarData(store, data.response))

            break

          case 'package':
            store.commit('booking/setBooked', usePackageCalendarData(store, data.response))

            break

          case 'event':
            store.commit('eventBooking/setBooked', useEventCalendarData(store, data.response))

            break
        }

        if (
          !(
            'request' in data &&
            'form' in data.request &&
            'shortcode' &&
            data.request.form &&
            'trigger' in data.request.form.shortcode &&
            data.request.form.shortcode.trigger
          )
        ) {
          useNotify(
            store,
            data.response,
            () => {},
            () => {},
          )
        }

        return {
          result: 'success',
          steps: data.request.form.steps,
          sidebar: data.request.form.sidebar,
        }
    }
  }
}

export default useRestore
