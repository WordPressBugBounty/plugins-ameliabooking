<template>
  <AmDialog
    v-model="popupVisible"
    width="650px"
    :append-to-body="true"
    :destroy-on-close="true"
    :show-close="props.ready && !props.loading && !props.loadingUpcoming"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    modal-class="amelia-v2-booking am-dialog-el"
    :custom-styles="props.cssVars"
    :aria-labelledby="dialogTitleId"
    @close="onCloseEventDialog"
    @closed="onClosedEventDialog"
    @opened="onOpenedEventDialog"
  >
    <template #header>
      <!-- Visually-hidden dialog title for screen readers -->
      <div :id="dialogTitleId" class="am-sr-only">
        {{ customizedStepLabels.event_booking || labels.event_booking || 'Event Booking' }}
      </div>

      <EventListHeader
        :ready="props.ready"
        :loading="props.loading"
        :loading-upcoming="props.loadingUpcoming"
        :customized-labels="customizedStepLabels"
      />
    </template>

    <template #default>
      <div
        id="amelia-container"
        ref="dialogContainer"
        :class="'am-' + props.formKey"
        :style="props.cssVars"
      >
        <component
          :is="currentStep"
          v-if="currentStep"
          :in-dialog="true"
          global-class="am-dialog-el__main-container"
        />
      </div>
    </template>

    <template #footer>
      <EventListFooter
        :ready="props.ready"
        :loading="props.loading"
        :loading-upcoming="props.loadingUpcoming"
        :second-button-show="secBtnShow && customerCabinetButton"
        :payment-gateway="store.getters['payment/getPaymentGateway']"
        :customized-labels="customizedStepLabels"
        :primary-footer-button-type="bookingBtnType"
        :secondary-footer-button-type="customizedStepOptions.secBtn.buttonType"
        :is-waiting-list="isWaitingList"
      />
    </template>
  </AmDialog>
</template>

<script setup>
import { computed, inject, markRaw, nextTick, provide, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

import { defaultCustomizeSettings } from '@/assets/js/common/defaultCustomize'
import useRestore from '@/assets/js/public/restore'
import { useScrollTo } from '@/assets/js/common/scrollElements'
import { useWaitingListAvailability } from '@/assets/js/public/events'

import AmDialog from '@/views/_components/dialog/AmDialog.vue'
import EventListHeader from '@/views/common/EventListFormConstruction/Header/Header.vue'
import EventListFooter from '@/views/common/EventListFormConstruction/Footer/Footer.vue'

import EventInfo from '../EventInfo/EventInfo.vue'
import EventTickets from '../EventTickets/EventTickets.vue'
import EventCustomerInfo from '../EventCustomerInfo/EventCustomerInfo.vue'
import EventPayment from '../EventPayment/EventPayment.vue'
import EventCongratulations from '../Congratulations/Congratulations.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  formKey: {
    type: String,
    required: true,
  },
  ready: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  loadingUpcoming: {
    type: Boolean,
    default: false,
  },
  cssVars: {
    type: Object,
    required: true,
  },
  resetEventIdOnClose: {
    type: Boolean,
    default: true,
  },
  skipEventTicketsStep: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const uid = Math.random().toString(36).slice(2, 8)
const dialogTitleId = `am-elf-dialog-title-${uid}`

const popupVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const store = useStore()
const amSettings = inject('settings')
const labels = inject('labels')
const localLanguage = inject('localLanguage')
const shortcodeData = inject('shortcodeData')

const eventInfo = markRaw(EventInfo)
const eventTickets = markRaw(EventTickets)
const eventCustomerInfo = markRaw(EventCustomerInfo)
const eventPayment = markRaw(EventPayment)
const eventCongratulations = markRaw(EventCongratulations)

const stepIndex = ref(0)
provide('stepIndex', stepIndex)

const baseSteps = !props.skipEventTicketsStep
  ? [eventInfo, eventCustomerInfo, eventCongratulations]
  : [eventCustomerInfo, eventCongratulations]
const stepsArray = ref(baseSteps)
provide('stepsArray', stepsArray)

const currentStep = computed(() => stepsArray.value[stepIndex.value] ?? null)

const eventFluidStepKey = ref([])
provide('eventFluidStepKey', eventFluidStepKey)

function removeStepComponent(component) {
  const arr = stepsArray.value
  const index = arr.indexOf(component)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

watch(
  eventFluidStepKey,
  (keys) => {
    const wantTickets = !props.skipEventTicketsStep && keys.indexOf('eventTickets') > -1
    const wantPayment = keys.indexOf('eventPayment') > -1

    if (!wantTickets) {
      removeStepComponent(eventTickets)
    }
    if (!wantPayment) {
      removeStepComponent(eventPayment)
    }

    const arr = stepsArray.value

    if (wantTickets && arr.indexOf(eventTickets) === -1) {
      const infoIdx = arr.findIndex((step) => step.name === 'EventInfo')
      const insertAt = infoIdx > -1 ? infoIdx + 1 : Math.min(stepIndex.value + 1, arr.length)
      arr.splice(insertAt, 0, eventTickets)
    }

    if (wantPayment && arr.indexOf(eventPayment) === -1) {
      const customerIdx = arr.findIndex((step) => step.name === 'EventCustomerInfo')
      const insertAt =
        customerIdx > -1 ? customerIdx + 1 : Math.min(stepIndex.value + 1, arr.length)
      arr.splice(insertAt, 0, eventPayment)
    }

    const len = stepsArray.value.length
    if (len === 0) {
      stepIndex.value = 0
    } else {
      stepIndex.value = Math.max(0, Math.min(stepIndex.value, len - 1))
    }
  },
  { deep: true },
)

// * Waiting list: vuex options aligned with selected event (parity with Events Calendar dialog flow).
const selectedEvent = computed(() =>
  store.getters['eventEntities/getEvent'](store.getters['eventBooking/getSelectedEventId']),
)

let isWaitingList = computed(() => useWaitingListAvailability(selectedEvent.value))

function syncEventWaitingListOptionsForSelectedEvent() {
  const event = selectedEvent.value
  if (event && useWaitingListAvailability(event)) {
    const waitingOptions =
      event.waitingList != null ? JSON.parse(JSON.stringify(event.waitingList)) : {}
    store.commit('eventWaitingListOptions/setAllData', { ...waitingOptions, isAvailable: true })
  } else {
    store.dispatch('eventWaitingListOptions/resetWaitingOptions')
  }
}

watch(selectedEvent, (event) => {
  if (event == null) {
    return
  }
  syncEventWaitingListOptionsForSelectedEvent()
})

const bringingAnyoneVisibility = ref(false)
provide('bringingAnyoneVisibility', bringingAnyoneVisibility)

const booked = computed(() => store.getters['eventBooking/getBooked'])
const footerButtonClicked = ref(false)
const footerBtnDisabled = ref(false)
const headerButtonPreviousClicked = ref(false)

const ifBookedCustomerCabinetUrl = computed(() => {
  if (booked.value !== null) {
    return booked.value.customerCabinetUrl.length > 0
  }

  return true
})

const customerCabinetButton = computed(() => {
  const step = currentStep.value
  if (!step) {
    return true
  }
  if (step.name === 'CongratulationsStep') {
    return !!amSettings.roles.customerCabinet.pageUrl && ifBookedCustomerCabinetUrl.value
  }

  return true
})

function nextStep() {
  store.commit('setLoading', true)
  stepIndex.value =
    stepIndex.value === stepsArray.value.length - 1 ? stepIndex.value : stepIndex.value + 1
}

function previousStep() {
  store.commit('setLoading', true)
  stepIndex.value = stepIndex.value - 1
  headerButtonPreviousClicked.value = !headerButtonPreviousClicked.value
}

function footerButtonClick() {
  footerButtonClicked.value = true

  const dialogEl = document.getElementsByClassName('am-dialog-el')[0]
  if (dialogEl && dialogEl.children.length) {
    useScrollTo(dialogEl.children[0], dialogEl.children[0].children[0], 50, 300)
  }
}

function footerButtonReset() {
  footerButtonClicked.value = false
}

function footerBtnDisabledUpdater(data) {
  footerBtnDisabled.value = data
}

function headerButtonPreviousClick() {
  headerButtonPreviousClicked.value = true
}

function headerButtonPreviousReset() {
  headerButtonPreviousClicked.value = false
}

function secondButtonClick() {
  const step = currentStep.value
  if (step?.name === 'CongratulationsStep' && booked.value) {
    window.location.href = booked.value.customerCabinetUrl
  } else {
    popupVisible.value = false
  }
}

provide('secondButton', { secondButtonClick })
provide('changingStepsFunctions', {
  nextStep,
  previousStep,
  footerButtonClick,
  footerButtonReset,
  footerBtnDisabledUpdater,
  footerButtonClicked,
  footerBtnDisabled,
  headerButtonPreviousClick,
  headerButtonPreviousReset,
  headerButtonPreviousClicked,
})

const dialogContainer = ref(null)
const dialogWidth = ref(0)
provide('dialogWidth', dialogWidth)

const injectedCustomizedDataForm = inject('customizedDataForm', null)
const customizedDataForm =
  injectedCustomizedDataForm ??
  computed(() => {
    if (amSettings.customizedData && props.formKey in amSettings.customizedData) {
      return amSettings.customizedData[props.formKey]
    }

    return defaultCustomizeSettings[props.formKey]
  })
if (!injectedCustomizedDataForm) {
  provide('customizedDataForm', customizedDataForm)
}

const langDetection = computed(() => amSettings.general.usedLanguages.includes(localLanguage.value))
const customizedStepLabels = computed(() => {
  const customLabels = {}

  const step = currentStep.value
  if (!step) {
    return labels
  }

  const stepKey = step.key
  const customizedLabels = customizedDataForm.value[stepKey].translations
  if (customizedLabels) {
    Object.keys(customizedLabels).forEach((labelKey) => {
      if (customizedLabels[labelKey][localLanguage.value] && langDetection.value) {
        customLabels[labelKey] = customizedLabels[labelKey][localLanguage.value]
      } else if (customizedLabels[labelKey].default) {
        customLabels[labelKey] = customizedLabels[labelKey].default
      }
    })
  }

  return Object.keys(customLabels).length ? customLabels : labels
})

const customizedStepOptions = computed(() => {
  const step = currentStep.value
  if (!step) {
    return {}
  }
  return customizedDataForm.value[step.key].options
})

const secBtnShow = computed(() => {
  if (
    'secBtn' in customizedStepOptions.value &&
    'visibility' in customizedStepOptions.value.secBtn
  ) {
    return customizedStepOptions.value.secBtn.visibility
  }

  return true
})

const bookingBtnType = computed(() => {
  const step = currentStep.value
  if (isWaitingList.value && step?.key === 'info') {
    if ('waitingBtn' in customizedStepOptions.value) {
      return customizedStepOptions.value.waitingBtn.buttonType
    }

    return 'filled'
  }

  return customizedStepOptions.value.primBtn?.buttonType ?? 'filled'
})

function onCloseEventDialog() {
  if (currentStep.value?.name === 'CongratulationsStep') {
    window.location.reload()
  }

  eventFluidStepKey.value = []
  stepIndex.value = 0
}

function onClosedEventDialog() {
  nextTick(() => {
    if (props.resetEventIdOnClose) {
      store.commit('eventBooking/setEventId', null)
    }

    store.dispatch('persons/resetPersons')
    store.dispatch('coupon/resetCoupon')
    store.dispatch('tickets/resetCustomTickets')
    store.dispatch('eventWaitingListOptions/resetWaitingOptions')
    store.dispatch('payment/resetPaymentData')
  })
}

function onOpenedEventDialog() {
  nextTick(() => {
    syncEventWaitingListOptionsForSelectedEvent()

    if (dialogContainer.value) {
      dialogWidth.value = dialogContainer.value.offsetWidth
    }

    if (
      props.skipEventTicketsStep &&
      stepIndex.value === 0 &&
      stepsArray.value.length > 1 &&
      stepsArray.value[0].name === 'EventInfo'
    ) {
      stepIndex.value = 1
    }
  })
}

onMounted(() => {
  const restore = useRestore(store, shortcodeData.value)
  if (!restore) {
    return
  }

  stepsArray.value.splice(0, stepsArray.value.length)
  stepIndex.value = 0

  restore.steps.forEach((key) => {
    if (props.skipEventTicketsStep && key === 'EventTickets') {
      return
    }

    switch (key) {
      case 'EventInfo':
        stepsArray.value.push(eventInfo)
        break
      case 'EventTickets':
        stepsArray.value.push(eventTickets)
        break
      case 'EventCustomerInfo':
        stepsArray.value.push(eventCustomerInfo)
        break
      case 'EventPayment':
        stepsArray.value.push(eventPayment)
        break
      case 'CongratulationsStep':
        stepsArray.value.push(eventCongratulations)
        break
    }

    stepIndex.value++
  })

  let index = -1
  if (restore.result === 'success') {
    index = stepsArray.value.length - 1
  } else if (restore.result === 'error' || restore.result === 'canceled') {
    index = stepsArray.value.length - 2
  }

  stepIndex.value = index
  popupVisible.value = true
})
</script>

<style lang="scss">
@import '@/assets/scss/public/overides/overides';
@import '@/assets/scss/common/reset/reset';
@import '@/assets/scss/common/icon-fonts/style';
@import '@/assets/scss/common/skeleton/skeleton.scss';
@import '@/assets/scss/common/empty-state/_empty-state-mixin.scss';
@import '@/assets/scss/common/transitions/_transitions-mixin.scss';

:root {
  // Colors
  // shortcuts
  // -c-    color
  // -bgr-  background
  // -prim- primary
  // -sec-  secondary
  // primitive colors
  --am-c-primary: #{$blue-1000};
  --am-c-success: #{$green-1000};
  --am-c-error: #{$red-900};
  --am-c-warning: #{$yellow-1000};
  // main container colors - right part of the form
  --am-c-main-bgr: #{$am-white};
  --am-c-main-heading-text: #{$shade-800};
  --am-c-main-text: #{$shade-900};
  // sidebar container colors - left part of the form
  --am-c-sb-bgr: #17295a;
  --am-c-sb-text: #{$am-white};
  // input global colors - usage input, textarea, checkbox, radio button, select input, adv select input
  --am-c-inp-bgr: #{$am-white};
  --am-c-inp-border: #{$shade-250};
  --am-c-inp-text: #{$shade-900};
  --am-c-inp-placeholder: #{$shade-500};
  // dropdown global colors - usage select dropdown, adv select dropdown
  --am-c-drop-bgr: #{$am-white};
  --am-c-drop-text: #{$shade-1000};
  // button global colors
  --am-c-btn-prim: #{$blue-900};
  --am-c-btn-prim-text: #{$am-white};
  --am-c-btn-sec: #{$am-white};
  --am-c-btn-sec-text: #{$shade-900};

  // Properties
  // shortcuts
  // -h- height
  // -fs- font size
  // -rad- border radius
  --am-h-inp: 40px;
  --am-fs-inp: 15px;
  --am-rad-inp: 6px;
  --am-fs-label: 15px;
  --am-fs-btn: 15px;

  // Font
  --am-font-family: 'Amelia Roboto', sans-serif;
}

.amelia-v2-booking {
  /* Event list dialog */
  // el - event list
  &.am-dialog-el.am-dialog-popup {
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99999999 !important;

    .el-dialog {
      // am - amelia
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--am-c-main-bgr);

      * {
        box-sizing: border-box;
        font-family: var(--am-font-family), sans-serif;
        word-break: break-word;
      }

      @media only screen and (max-width: 768px) {
        margin-top: 0;
      }

      // Visually hidden utility – content accessible to screen readers only
      .am-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    }
  }

  .el-skeleton {
    width: 100%;
    padding: 16px 32px;
  }

  * {
    font-family: var(--am-font-family, 'Amelia Roboto'), sans-serif;
    font-style: initial;
    box-sizing: border-box;
    word-break: break-word;
  }

  // elf - events list form; ecf - events calendar form
  &.am-elf,
  &.am-ecf {
    margin: 0 auto;
    max-width: var(--am-mw-main);
    background-color: var(--am-c-main-bgr);
  }

  // el - event list
  .am-dialog-el {
    &__main-container {
      @media only screen and (max-width: 768px) {
        overflow: visible;
      }

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 6px;
        background: var(--am-c-scroll-op30);
      }

      &::-webkit-scrollbar-track {
        border-radius: 6px;
        background: var(--am-c-scroll-op10);
      }
    }
  }
}
</style>
