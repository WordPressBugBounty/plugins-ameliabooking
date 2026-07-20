<template>
  <Teleport v-if="selectionSidebarItems.length > 0" to="#wpa-events-tickets-mount">
    <WpaEventsSelectionSidebar
      :event-css-vars="cssVars"
      :title="selectionSidebarTitle"
      :subtitle="selectionSidebarSubtitle"
      :items="selectionSidebarItems"
      @qty-update="onSelectionQtyUpdate"
    />
  </Teleport>
  <Teleport v-if="wpaFooterTeleportEnabled" to="#wpa-events-footer-mount">
    <WpaEventsBookButton
      :event-css-vars="cssVars"
      :event-id="eventId"
      :book-label="bookLabel"
      :book-disabled="bookDisabled"
      :button-type="bookButtonType"
      :button-category="bookButtonCategory"
      @book="onBookClick"
    />
  </Teleport>
  <div id="amelia-container" ref="ameliaContainer" class="am-ecf" :style="cssVars">
    <EventBookingDialog
      v-model="popupVisible"
      form-key="ecf"
      :ready="ready"
      :loading="loading"
      :loading-upcoming="false"
      :css-vars="cssVars"
      :reset-event-id-on-close="false"
      :skip-event-tickets-step="true"
    />
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  reactive,
  inject,
  provide,
  nextTick,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import { useStore } from 'vuex'
import moment from 'moment/moment'

import EventBookingDialog from '../Common/EventBookingDialog/EventBookingDialog.vue'
import WpaEventsBookButton from './WpaEventsBookButton.vue'
import WpaEventsSelectionSidebar from './WpaEventsSelectionSidebar.vue'
import { defaultCustomizeSettings } from '@/assets/js/common/defaultCustomize'
import useAction from '@/assets/js/public/actions'
import { applyCustomFontFaceIfSelected } from '@/assets/js/public/customFontFace'
import { eventFormCssVars } from '@/assets/js/public/eventFormCssVars'
import { useRenderAction } from '@/assets/js/public/renderActions'

const store = useStore()
const amSettings = inject('settings')
const shortcodeData = inject('shortcodeData')

const wpaTicketsList = computed(() => {
  const raw = shortcodeData.value?.wpaTickets
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter((t) => t && parseInt(t.id, 10) > 0 && t.name)
})

const ticketStrings = computed(() => shortcodeData.value?.wpaTicketStrings || {})

const attendeesConfig = computed(() => {
  const raw = shortcodeData.value?.wpaAttendees
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const min = parseInt(raw.min, 10)
  const max = parseInt(raw.max, 10)
  const slotsLeft = parseInt(raw.slotsLeft, 10)
  if (isNaN(min) || isNaN(max) || max <= min) {
    return null
  }

  return {
    min,
    max,
    default: parseInt(raw.default, 10) || min,
    slotsLeft: isNaN(slotsLeft) ? max : slotsLeft,
  }
})

const attendeesPersons = ref(1)

watch(
  attendeesConfig,
  (config) => {
    if (!config) {
      attendeesPersons.value = 1
      return
    }
    attendeesPersons.value = config.default
  },
  { immediate: true },
)

const eventId = computed(() => parseInt(shortcodeData.value?.eventId, 10) || 0)

const bookLabel = computed(() => ticketStrings.value?.bookEvent || '')

const qtyById = reactive({})

function ensureQtyKeys() {
  wpaTicketsList.value.forEach((t) => {
    const id = String(t.id)
    if (!(id in qtyById)) {
      qtyById[id] = 0
    }
  })
}

watch(wpaTicketsList, ensureQtyKeys, { immediate: true })

function qty(ticketId) {
  return qtyById[String(ticketId)] ?? 0
}

const selectionSidebarTitle = computed(() => {
  if (wpaTicketsList.value.length > 0) {
    return ticketStrings.value.selectTickets || ''
  }
  return ticketStrings.value.attendeesTitle || ''
})

const selectionSidebarSubtitle = computed(() => {
  if (wpaTicketsList.value.length > 0) {
    return ticketStrings.value.selectTicketsSub || ''
  }
  return ticketStrings.value.attendeesSubtitle || ''
})

const selectionSidebarItems = computed(() => {
  if (wpaTicketsList.value.length > 0) {
    const sharedSpotsLeft = sharedWaitingListSpotsLeft.value

    return wpaTicketsList.value.map((ticket) => {
      const left = Math.max(0, ticket.left || 0)
      const currentQty = qty(ticket.id)
      const remainingShared =
        sharedSpotsLeft === null
          ? null
          : Math.max(0, sharedSpotsLeft - (selectedTicketsTotal.value - currentQty))
      const max = remainingShared === null ? left : Math.min(left, remainingShared)

      return {
        id: ticket.id,
        name: ticket.name,
        left: remainingShared === null ? left : Math.min(left, remainingShared + currentQty),
        leftLabel: ticketStrings.value.ticketsLeft || '',
        priceFormatted: ticket.priceFormatted || '',
        min: 0,
        max,
        quantity: currentQty,
        disabled: max <= 0 && currentQty <= 0,
        ariaLabel: `${ticketStrings.value.selectTickets || ''} — ${ticket.name}`,
        kind: 'ticket',
      }
    })
  }

  if (!attendeesConfig.value) {
    return []
  }

  return [
    {
      id: 'attendees',
      left: attendeesConfig.value.slotsLeft,
      leftLabel: ticketStrings.value.slotsLeft || '',
      min: attendeesConfig.value.min,
      max: attendeesConfig.value.max,
      quantity: attendeesPersons.value,
      disabled: false,
      ariaLabel: ticketStrings.value.attendeesTitle || '',
      kind: 'attendees',
    },
  ]
})

function onSelectionQtyUpdate(item, val) {
  let n = typeof val === 'number' ? val : parseInt(String(val), 10)
  if (isNaN(n)) {
    n = item.min ?? 0
  }

  const min = item.min ?? 0
  const max = item.max ?? 0
  n = Math.min(max, Math.max(min, n))

  if (item.kind === 'attendees') {
    attendeesPersons.value = n
    return
  }

  qtyById[String(item.id)] = n
}

const selectedPayload = computed(() => {
  return wpaTicketsList.value
    .filter((t) => qty(t.id) > 0)
    .map((t) => ({
      id: parseInt(t.id, 10),
      quantity: qty(t.id),
      available:
        sharedWaitingListSpotsLeft.value === null
          ? t.left
          : Math.min(Math.max(0, t.left || 0), sharedWaitingListSpotsLeft.value),
    }))
})

const requiresTickets = computed(() => wpaTicketsList.value.length > 0)

const eventBookable = computed(() => shortcodeData.value?.wpaEventBookable !== false)

const wpaFooterTeleportEnabled = computed(() => eventId.value > 0 && eventBookable.value)

const waitingListAvailable = computed(
  () => shortcodeData.value?.wpaEventWaitingListAvailable === true,
)

const sharedWaitingListSpotsLeft = computed(() => {
  if (!waitingListAvailable.value || !shortcodeData.value?.wpaMaxCustomCapacity) {
    return null
  }

  const spotsLeft = parseInt(shortcodeData.value?.wpaWaitingListSpotsLeft, 10)
  return isNaN(spotsLeft) ? 0 : Math.max(0, spotsLeft)
})

const selectedTicketsTotal = computed(() => {
  return wpaTicketsList.value.reduce((sum, ticket) => sum + qty(ticket.id), 0)
})

const bookDisabled = computed(() => {
  return (
    !(eventId.value > 0) ||
    !eventBookable.value ||
    (requiresTickets.value && selectedPayload.value.length === 0)
  )
})

const infoCustomizeOptions = computed(() => {
  const customized = amSettings.customizedData?.ecf?.info?.options
  const defaults = defaultCustomizeSettings.ecf?.info?.options || {}
  return {
    ...defaults,
    ...(customized || {}),
  }
})

const bookButtonCategory = computed(() => (waitingListAvailable.value ? 'waiting' : 'primary'))

const bookButtonType = computed(() => {
  if (waitingListAvailable.value) {
    return infoCustomizeOptions.value.waitingBtn?.buttonType || 'filled'
  }

  return infoCustomizeOptions.value.primBtn?.buttonType || 'filled'
})

const popupVisible = ref(false)
provide('popupVisible', popupVisible)

store.commit('setFormKey', 'ecf')
store.commit('shortcodeParams/setForm', 'eventCalendarForm')
store.commit('shortcodeParams/setShortcodeParams', shortcodeData.value)
store.commit('bookableType/setType', 'event')
store.commit('eventEntities/setEventsDisplay', 'calendar')

let dynamicVh = ref(0)
function updateVH() {
  dynamicVh.value = window.visualViewport?.height ?? window.innerHeight
}

window.addEventListener('resize', updateVH)

let ameliaContainer = ref(null)
let containerWidth = ref(0)
provide('containerWidth', containerWidth)

function resize() {
  if (ameliaContainer.value) {
    containerWidth.value = ameliaContainer.value.offsetWidth
  }
}

window.addEventListener('resize', resize)

const ready = computed(() => store.getters['getReady'])
const loading = computed(() => store.getters['getLoading'])
const events = computed(() => store.getters['eventEntities/getEvents'])
const selectedEvent = computed(() =>
  store.getters['eventEntities/getEvent'](store.getters['eventBooking/getSelectedEventId']),
)

function useEvents(hookModifiedEvents) {
  store.commit('eventEntities/setEvents', hookModifiedEvents)
}

let futureMonthsNumber = ref(1)
useRenderAction('upcomingDateRange', { futureMonthsNumber })

store.commit('params/setDates', [
  moment().startOf('month').subtract(15, 'days').format('YYYY-MM-DD'),
  moment().endOf('month').add(15, 'days').format('YYYY-MM-DD'),
])
store.commit('pagination/setPage', 0)

store.dispatch('eventEntities/requestEntities', {
  types: ['tags', 'employees', 'locations', 'customFields', 'taxes'],
  loadEntities: shortcodeData.value.hasApiCall || shortcodeData.value.trigger,
})

function clampTicketQty(raw, max) {
  let q = parseInt(raw, 10)
  if (isNaN(q) || q < 0) {
    q = 0
  }
  if (q > max) {
    q = max
  }
  return q
}

function normalizePreselectedTickets(payloadTickets) {
  if (!Array.isArray(payloadTickets)) {
    return []
  }

  return payloadTickets
    .filter((t) => t && typeof t === 'object')
    .map((ticket) => {
      const id = parseInt(ticket.id, 10)
      const available = parseInt(ticket.available, 10)
      const quantity = clampTicketQty(
        ticket.quantity,
        isNaN(available) ? Number.MAX_SAFE_INTEGER : available,
      )

      return {
        id,
        quantity,
        available: isNaN(available) ? null : available,
      }
    })
    .filter((ticket) => !isNaN(ticket.id) && ticket.quantity > 0)
}

function applyAttendeesPersonsToStore() {
  if (!attendeesConfig.value) {
    return
  }

  store.commit('persons/setMinPersons', attendeesConfig.value.min)
  store.commit('persons/setMaxPersons', attendeesConfig.value.max)
  store.commit('persons/setPersons', attendeesPersons.value)
}

function handleWpaOpenBooking(event) {
  const detail = event && event.detail ? event.detail : {}
  const resolvedEventId = parseInt(detail.eventId || shortcodeData.value.eventId, 10)
  if (isNaN(resolvedEventId) || !resolvedEventId) {
    return
  }

  const selectedTickets = normalizePreselectedTickets(detail.tickets)
  store.commit('tickets/setPendingPreselectedTickets', selectedTickets)
  applyAttendeesPersonsToStore()
  store.commit('eventBooking/setEventId', resolvedEventId)
  useAction(store, {}, 'SelectEvent', 'event', null, null)
  popupVisible.value = true
}

function onOpenBookingFromSidebar(payload) {
  handleWpaOpenBooking({ detail: payload })
}

function onBookClick() {
  if (bookDisabled.value) {
    return
  }
  onOpenBookingFromSidebar({
    eventId: eventId.value,
    tickets: selectedPayload.value,
  })
}

watch(
  [popupVisible, selectedEvent],
  ([visible, currentEvent]) => {
    if (!visible || !currentEvent || !currentEvent.id) {
      return
    }

    if (attendeesConfig.value && !currentEvent.customPricing) {
      applyAttendeesPersonsToStore()
      return
    }

    if (!currentEvent.customPricing) {
      return
    }

    if (!store.getters['tickets/getTicketsData'].length) {
      store.commit('tickets/setTickets', currentEvent.customTickets || [])
    }

    if (currentEvent.maxCustomCapacity != null) {
      store.commit('tickets/setMaxCustomCapacity', currentEvent.maxCustomCapacity)
    }

    if (currentEvent.maxExtraPeople != null) {
      store.commit('tickets/setMaxExtraPeople', currentEvent.maxExtraPeople)
    }

    store.commit('tickets/applyPendingPreselectedTickets', {
      waitingMode: shortcodeData.value?.wpaEventWaitingListAvailable === true,
      sharedWaitingSpotsLeft:
        shortcodeData.value?.wpaMaxCustomCapacity === true
          ? parseInt(shortcodeData.value?.wpaWaitingListSpotsLeft, 10) || 0
          : null,
    })
  },
  { immediate: true },
)

onMounted(() => {
  const wrapper = document.getElementById('amelia-v2-booking-' + shortcodeData.value.counter)
  if (wrapper) {
    wrapper.classList.add('amelia-v2-booking-' + shortcodeData.value.counter + '-loaded')
  }

  watch(ready, (current) => {
    if (current) {
      useAction(store, { events, useEvents }, 'ViewContent', 'event', null, null)
    }
  })

  nextTick(() => {
    resize()
  })

  useAction(store, { containerWidth }, 'ContainerWidth', 'event', null, null)
  updateVH()
  document.addEventListener('ameliaWpaOpenBooking', handleWpaOpenBooking)
})

onBeforeUnmount(() => {
  document.removeEventListener('ameliaWpaOpenBooking', handleWpaOpenBooking)
  window.removeEventListener('resize', updateVH)
  window.removeEventListener('resize', resize)
})

const amFonts = ref(
  amSettings.customizedData ? amSettings.customizedData.fonts : defaultCustomizeSettings.fonts,
)
provide('amFonts', amFonts)

applyCustomFontFaceIfSelected(amFonts.value)
watch(
  amFonts,
  (fonts) => {
    applyCustomFontFaceIfSelected(fonts)
  },
  { deep: true },
)

const amColors = computed(() => {
  return amSettings.customizedData && 'ecf' in amSettings.customizedData
    ? amSettings.customizedData.ecf.colors
    : defaultCustomizeSettings.ecf.colors
})
provide('amColors', amColors)

const cssVars = eventFormCssVars(amColors, amFonts, dynamicVh)
</script>

<script>
export default {
  name: 'WpaEventsLandingFormWrapper',
}
</script>
