<template>
  <div
    id="amelia-container"
    ref="ameliaContainer"
    class="am-elf"
    :style="cssVars"
    role="main"
    :aria-busy="!ready || loading"
  >
    <EventsList />
    <EventBookingDialog
      v-model="popupVisible"
      form-key="elf"
      :ready="ready"
      :loading="loading"
      :css-vars="cssVars"
      :reset-event-id-on-close="true"
    />
  </div>
  <BackLink />
</template>

<script setup>
import { computed, ref, inject, provide, nextTick, watch, onMounted } from 'vue'

import { useStore } from 'vuex'

import useAction from '@/assets/js/public/actions'
import { defaultCustomizeSettings } from '@/assets/js/common/defaultCustomize'
import { applyCustomFontFaceIfSelected } from '@/assets/js/public/customFontFace'
import { eventFormCssVars } from '@/assets/js/public/eventFormCssVars'

import BackLink from '../../Parts/BackLink'
import EventsList from './EventsList/EventsList.vue'
import EventBookingDialog from '../Common/EventBookingDialog/EventBookingDialog.vue'

let dynamicVh = ref(0)
function updateVH() {
  dynamicVh.value = window.visualViewport.height
}

window.addEventListener('resize', updateVH)

const popupVisible = ref(false)
provide('popupVisible', popupVisible)

const amSettings = inject('settings')
const shortcodeData = inject('shortcodeData')

const customizedDataForm = computed(() => {
  return amSettings.customizedData && 'elf' in amSettings.customizedData
    ? amSettings.customizedData.elf
    : defaultCustomizeSettings.elf
})
provide('customizedDataForm', customizedDataForm)

const store = useStore()
store.commit('setFormKey', 'elf')
store.commit('shortcodeParams/setShortcodeParams', shortcodeData.value)
store.commit('bookableType/setType', 'event')

let ameliaContainer = ref(null)
let containerWidth = ref(0)
provide('containerWidth', containerWidth)

function resize() {
  if (ameliaContainer.value) {
    containerWidth.value = ameliaContainer.value.offsetWidth
  }
}

window.addEventListener('resize', resize)

let ready = computed(() => store.getters['getReady'])
let loading = computed(() => store.getters['getLoading'])
let events = computed(() => store.getters['eventEntities/getEvents'])

function useEvents(hookModifiedEvents) {
  store.commit('eventEntities/setEvents', hookModifiedEvents)
}

store.dispatch('eventEntities/requestEntities', {
  types: ['tags', 'employees', 'locations', 'customFields', 'taxes'],
  loadEntities: shortcodeData.value.hasApiCall || shortcodeData.value.trigger,
})

const loadDialogCounter = inject('loadDialogCounter', ref(null))
watch(loadDialogCounter, () => {
  if (shortcodeData.value.in_dialog && store.getters['eventEntities/getEventsDisplay']) {
    store.dispatch('eventEntities/requestEvents', store.getters['eventEntities/getEventsDisplay'])
  } else if (shortcodeData.value.in_dialog) {
    store.dispatch('eventEntities/requestEvents')
  }
})

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
})

const amFonts = ref(
  amSettings.customizedData ? amSettings.customizedData.fonts : defaultCustomizeSettings.fonts,
)
provide('amFonts', amFonts)

let amColors = computed(() => {
  return amSettings.customizedData && 'elf' in amSettings.customizedData
    ? amSettings.customizedData.elf.colors
    : defaultCustomizeSettings.elf.colors
})
provide('amColors', amColors)

const cssVars = eventFormCssVars(amColors, amFonts, dynamicVh)

applyCustomFontFaceIfSelected(amFonts.value)
</script>

<script>
export default {
  name: 'EventsListFormWrapper',
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    // am - amelia
    // elf - events list form
    &.am-elf {
      margin: 0 auto;
      max-width: var(--am-mw-main);
      background-color: var(--am-c-main-bgr);
      padding: 16px;
      border-radius: 12px;
    }
  }
}
</style>
