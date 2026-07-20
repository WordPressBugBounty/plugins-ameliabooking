<template>
  <section
    class="am-caewh-section"
    role="region"
    :aria-label="regionLabel || undefined"
    :style="cssVars"
  >
    <div v-if="regionLabel" class="am-caewh__sr-only">
      {{ regionLabel }}
    </div>

    <ul class="am-caewh" role="list">
      <li
        v-for="(weekDay, weekDayIndex) in employee.weekDayList"
        :key="weekDays[weekDayIndex].value"
        class="am-caewh__item"
      >
        <section :aria-labelledby="weekDayHeadingId(weekDayIndex)">
          <div
            class="am-caewh__header"
            role="group"
            :aria-labelledby="weekDayHeadingId(weekDayIndex)"
          >
            <div :id="weekDayHeadingId(weekDayIndex)" class="am-caewh__header-text">
              {{ weekDays[weekDayIndex].label }}
            </div>

            <AmSwitch
              :id="weekDaySwitchId(weekDayIndex)"
              v-model="weekDay.enabled"
              size="small"
              :aria-label="weekDaySwitchAriaLabel(weekDayIndex)"
              :aria-controls="weekDayContentId(weekDayIndex)"
              :aria-expanded="weekDay.enabled ? 'true' : 'false'"
            />
          </div>

          <div
            :id="weekDayContentId(weekDayIndex)"
            class="am-caewh__content"
            role="region"
            :aria-label="weekDayPeriodsAriaLabel(weekDayIndex)"
            :hidden="!weekDay.enabled"
          >
            <Periods
              :title="amLabels.working_hours"
              :enabled="weekDay.enabled"
              :index="weekDayIndex"
              :type="'weekDayList'"
              :responsive-class="props.responsiveClass"
            />
          </div>
        </section>
      </li>
    </ul>
  </section>
</template>

<script setup>
// * Import from Vue
import { ref, inject, computed, unref } from 'vue'

// * Import from Vuex
import { useStore } from 'vuex'

// * _components
import AmSwitch from '../../../../../_components/switch/AmSwitch.vue'

// * Dedicated components
import Periods from './Periods.vue'

// * Composables
import { useColorTransparency } from '../../../../../../assets/js/common/colorManipulation'

let props = defineProps({
  responsiveClass: {
    type: String,
    default: '',
  },
})

// * Store
let store = useStore()

// * Labels
let amLabels = inject('amLabels')

function pickAmLabel(keys) {
  const L = unref(amLabels)
  if (!L) {
    return ''
  }
  for (const k of keys) {
    if (L[k]) {
      return String(L[k])
    }
  }
  return ''
}

let regionLabel = computed(() => pickAmLabel(['working_hours']))

let employee = computed(() => {
  return store.getters['employee/getEmployee']
})

let weekDays = ref([
  {
    label: amLabels.weekday_monday,
    value: 'monday',
  },
  {
    label: amLabels.weekday_tuesday,
    value: 'tuesday',
  },
  {
    label: amLabels.weekday_wednesday,
    value: 'wednesday',
  },
  {
    label: amLabels.weekday_thursday,
    value: 'thursday',
  },
  {
    label: amLabels.weekday_friday,
    value: 'friday',
  },
  {
    label: amLabels.weekday_saturday,
    value: 'saturday',
  },
  {
    label: amLabels.weekday_sunday,
    value: 'sunday',
  },
])

function weekDayHeadingId(index) {
  return `am-caewh-heading-${index}`
}

function weekDaySwitchId(index) {
  return `am-caewh-switch-${index}`
}

function weekDayContentId(index) {
  return `am-caewh-content-${index}`
}

function weekDaySwitchAriaLabel(index) {
  const day = weekDays.value[index]?.label
  const enabled = employee.value?.weekDayList?.[index]?.enabled
  const L = unref(amLabels)
  const status = enabled
    ? pickAmLabel(['enabled', 'active', 'on'])
    : pickAmLabel(['disabled', 'inactive', 'off'])
  return [day, L?.working_hours, status].filter(Boolean).join(', ')
}

function weekDayPeriodsAriaLabel(index) {
  const day = weekDays.value[index]?.label
  const L = unref(amLabels)
  return [day, L?.working_hours].filter(Boolean).join(', ')
}

// * Colors
let amColors = inject('amColors')

let cssVars = computed(() => {
  return {
    '--am-c-caewh-primary': amColors.value.colorPrimary,
    '--am-c-caewh-bgr': amColors.value.colorMainBgr,
    '--am-c-caewh-text': amColors.value.colorMainText,
    '--am-c-caewh-text-op03': useColorTransparency(amColors.value.colorMainText, 0.03),
    '--am-c-caewh-bgr-op03': useColorTransparency(amColors.value.colorInpBgr, 0.03),
  }
})
</script>

<script>
export default {
  name: 'WeekDays',
}
</script>

<style lang="scss">
@mixin am-cabinet-employee-weekdays {
  //am    - amelia
  //caewh - cabinet employee working hours
  .am-caewh-section {
    .am-caewh__sr-only {
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

  .am-caewh {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;

    &__item {
      padding: 0;
      border-radius: 8px;
      background-color: var(--am-c-caewh-text-op03);
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      gap: 8px;

      &-text {
        margin: 0;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        color: var(--am-c-caewh-text);
      }
    }

    &__content {
      display: flex;
      padding: 0 24px;
    }

    .am-switch .el-switch__core:focus-visible {
      box-shadow: 0 0 2px 2px var(--am-c-caewh-primary);
      outline: none;
    }
  }
}

.amelia-v2-booking #amelia-container {
  @include am-cabinet-employee-weekdays;
}
</style>
