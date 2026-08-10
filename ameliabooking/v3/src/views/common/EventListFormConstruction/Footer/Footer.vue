<template>
  <div
    v-if="props.ready && !props.loading && !props.loadingUpcoming"
    class="am-elf__footer"
    :class="{ 'am-congrats': isCongratzStep && props.secondButtonShow }"
  >
    <AmButton
      v-if="props.secondButtonShow"
      category="secondary"
      :type="props.secondaryFooterButtonType"
      size="medium"
      @click="secondButtonClick"
    >
      {{ displayLabels(secondaryBtnLabel) }}
    </AmButton>
    <div
      v-if="props.paymentGateway === 'payPal' && !isCongratzStep"
      :id="`am-paypal-element-${shortcodeData.counter}`"
    ></div>
    <AmButton
      v-if="props.paymentGateway !== 'payPal' || isCongratzStep"
      :class="[{ mainBtnClass }, { 'square-continue': props.paymentGateway === 'square' }]"
      :type="props.primaryFooterButtonType"
      :category="isWaitingListStep() ? 'waiting' : 'primary'"
      size="medium"
      :disabled="footerBtnDisabled"
      @click="footerButtonClick"
    >
      {{ displayLabels(primaryBtnLabel) }}
    </AmButton>
  </div>
  <!-- Skeleton -->
  <div v-else class="am-elf__footer-skeleton">
    <el-skeleton animated>
      <template #template>
        <el-skeleton-item />
        <el-skeleton-item />
      </template>
    </el-skeleton>
  </div>
  <!-- /Skeleton -->
</template>

<script setup>
import AmButton from '../../../_components/button/AmButton.vue'

import { inject, ref, computed } from 'vue'

let props = defineProps({
  ready: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingUpcoming: {
    type: Boolean,
    default: false,
  },
  customizedLabels: {
    type: Object,
    default: () => {
      return {}
    },
  },
  primaryFooterButtonType: {
    type: String,
    default: 'filled',
  },
  secondaryFooterButtonType: {
    type: String,
    default: 'plain',
  },
  waitingFooterButtonType: {
    type: String,
    default: 'filled',
  },
  paymentGateway: {
    type: String,
    default: '',
  },
  secondButtonShow: {
    type: Boolean,
    default: true,
  },
  isWaitingList: {
    type: Boolean,
    default: false,
  },
})

// * Step Functions
const { secondButtonClick } = inject('secondButton', {
  secondButtonClick: () => {},
})

const { footerButtonClick, footerBtnDisabled } = inject('changingStepsFunctions', {
  footerButtonClick: () => {},
  footerBtnDisabled: ref(false),
})

const steps = inject('stepsArray')
const currentStep = inject('stepIndex')

const isCongratzStep = computed(() => {
  return currentStep.value === steps.value.length - 1
})

let primaryBtnLabel = computed(() => {
  if (isWaitingListStep()) {
    // TODO - check from where to pass waitingList settings
    return 'join_waiting_list'
  }

  if (
    steps.value[currentStep.value].name === 'EventInfo' ||
    steps.value[currentStep.value].name === 'EventPayment'
  ) {
    return 'event_book_event'
  }

  if (steps.value[currentStep.value].name === 'CongratulationsStep') return 'finish_appointment'

  return 'continue'
})

let secondaryBtnLabel = computed(() => {
  if (steps.value[currentStep.value].name === 'CongratulationsStep') return 'congrats_panel'

  return 'event_close'
})

let mainBtnClass = computed(() => {
  if (steps.value[currentStep.value].name === 'CongratulationsStep')
    return 'am-elf__footer-btn__finish'

  return ''
})

const shortcodeData = inject(
  'shortcodeData',
  ref({
    counter: 1000,
  }),
)

// * Labels
const amLabels = inject('labels')
function displayLabels(label) {
  return Object.keys(props.customizedLabels).length && props.customizedLabels[label]
    ? props.customizedLabels[label]
    : amLabels[label]
}

function isWaitingListStep() {
  return (
    (steps.value[currentStep.value].name === 'EventInfo' ||
      steps.value[currentStep.value].name === 'EventTickets') &&
    props.isWaitingList
  )
}
</script>

<script>
export default {
  name: 'EventListFooter',
}
</script>

<style lang="scss">
@mixin main-content-footer {
  // am -- amelia
  // elf -- event list form
  // Amelia Form Steps
  .am-elf {
    &__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 28px;

      &.am-congrats {
        justify-content: space-between;
      }

      .am-button {
        &--primary {
          &.is-disabled {
            cursor: not-allowed;
          }
        }
      }

      &-btn {
        &__finish {
          margin-left: auto !important;
        }
      }

      &-skeleton {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        box-shadow: 0 -2px 3px rgba(26, 44, 55, 0.15);

        .el-skeleton {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          padding: 16px 24px;

          &__item {
            width: 109px;
            height: 40px;

            &:first-child {
              margin-right: 12px;
            }
          }
        }
      }
    }
  }
}

// Public
.amelia-v2-booking {
  @include main-content-footer;
}

// Admin
#amelia-app-backend-new {
  @include main-content-footer;
}
</style>
