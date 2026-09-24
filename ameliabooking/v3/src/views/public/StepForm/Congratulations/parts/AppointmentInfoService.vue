<template>
  <!-- Date -->
  <div class="am-fs__ci-label">{{ amLabels.congrats_date }}:</div>
  <div class="am-fs__ci-value">{{ getFrontedFormattedDate(date) }}</div>
  <!-- /Date -->

  <!-- Time -->
  <div class="am-fs__ci-label">{{ amLabels.congrats_time }}:</div>
  <div class="am-fs__ci-value">{{ getFrontedFormattedTime(useFormatTime(time)) }}</div>
  <!-- /Time -->

  <!-- Service -->
  <div class="am-fs__ci-label">{{ amLabels.congrats_service }}:</div>
  <div class="am-fs__ci-value">{{ bookable ? bookable.name : '' }}</div>
  <!-- /Service -->

  <!-- Employee -->
  <div class="am-fs__ci-label">{{ amLabels.congrats_employee }}:</div>
  <div class="am-fs__ci-value">
    {{ employee ? employee.firstName + ' ' + employee.lastName : '' }}
  </div>
  <!-- /Employee -->

  <!-- Location -->
  <template v-if="location">
    <div class="am-fs__ci-label">{{ amLabels.congrats_location }}:</div>
    <div class="am-fs__ci-value">{{ location.address ? location.address : location.name }}</div>
  </template>
  <!-- /Location -->

  <!-- Recurring -->
  <template v-if="booked.data.length > 1">
    <div class="am-fs__ci-label">{{ amLabels.recurring }}:</div>
    <div class="am-fs__ci-value">{{ amLabels.appointment_repeats }} x{{ booked.data.length }}</div>
  </template>
  <!-- /Recurring -->
</template>

<script setup>
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
import {
  getFrontedFormattedTime,
  getFrontedFormattedDate,
  useFormatTime,
} from '../../../../../assets/js/common/date'

const store = useStore()

const amLabels = inject('amLabels')

let booked = inject('booked')

let date = computed(() => (booked.value ? booked.value.data[0].start.split(' ')[0] : ''))

let time = computed(() => (booked.value ? booked.value.data[0].start.split(' ')[1] : ''))

let bookable = computed(() => {
  return booked.value
    ? store.getters['entities/getServices'].find((i) => i.id === booked.value.data[0].serviceId)
    : null
})

let employee = computed(() => {
  return booked.value
    ? store.getters['entities/getEmployees'].find((i) => i.id === booked.value.data[0].providerId)
    : null
})

let location = computed(() => {
  return booked.value && booked.value.data[0].locationId
    ? store.getters['entities/getLocations'].find((i) => i.id === booked.value.data[0].locationId)
    : null
})
</script>

<script>
export default {
  name: 'AppointmentInfoService',
}
</script>
