<template>
  <!-- Date -->
  <div class="am-fs__ci-label">{{ labelsDisplay('congrats_date') }}:</div>
  <div class="am-fs__ci-value">{{ moment().format('YYYY-MM-DD') }}</div>
  <!-- /Date -->

  <!-- Time -->
  <div class="am-fs__ci-label">{{ labelsDisplay('congrats_time') }}:</div>
  <div class="am-fs__ci-value">{{ moment().format('hh:mm') }}</div>
  <!-- /Time -->

  <!-- Service -->
  <div class="am-fs__ci-label">{{ labelsDisplay('congrats_service') }}:</div>
  <div class="am-fs__ci-value">Service 1</div>
  <!-- /Service -->

  <!-- Employee -->
  <div class="am-fs__ci-label">{{ labelsDisplay('congrats_employee') }}:</div>
  <div class="am-fs__ci-value">Jane Doe</div>
  <!-- /Employee -->

  <!-- Location -->
  <template v-if="!licence.isLite && !licence.isStarter">
    <div class="am-fs__ci-label">{{ labelsDisplay('congrats_location') }}:</div>
    <div class="am-fs__ci-value">Lorem Ipsum, 18</div>
  </template>
  <!-- /Location -->
</template>

<script setup>
import moment from 'moment'
import { computed, inject } from 'vue'
import { useReactiveCustomize } from '../../../../../assets/js/admin/useReactiveCustomize.js'

// * Plugin Licence
let licence = inject('licence')

let langKey = inject('langKey')
let amLabels = inject('labels')

let pageRenderKey = inject('pageRenderKey')
const { amCustomize } = useReactiveCustomize()

// * Label computed function
function labelsDisplay(label) {
  let computedLabel = computed(() => {
    return amCustomize.value[pageRenderKey.value].congratulations.translations &&
      amCustomize.value[pageRenderKey.value].congratulations.translations[label] &&
      amCustomize.value[pageRenderKey.value].congratulations.translations[label][langKey.value]
      ? amCustomize.value[pageRenderKey.value].congratulations.translations[label][langKey.value]
      : amLabels[label]
  })

  return computedLabel.value
}
</script>

<script>
export default {
  name: 'AppointmentInfoService',
}
</script>

<style lang="scss"></style>
