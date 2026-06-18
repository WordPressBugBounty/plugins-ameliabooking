<template>
  <el-popover
    v-if="usePaymentFromCustomerPanel(props.reservation, props.bookable.settings)"
    ref="payRef"
    :visible="payPopVisible"
    :persistent="false"
    :show-arrow="false"
    :popper-class="'am-cc__popper'"
    :popper-style="cssVars"
    trigger="click"
  >
    <template #reference>
      <AmButton
        ref="menuTriggerRef"
        :size="props.btnSize"
        :type="props.type"
        :suffix="paymentMethods.length > 1 && usePayable(store, props.reservation) ? arrowDown : ''"
        :class="[{'am-button-single': paymentMethods.length === 1 || !usePayable(store, props.reservation)}, props.class]"
        :loading="!!paymentButtonLoader"
        :loading-icon="'loading'"
        :disabled="!usePayable(store, props.reservation)"
        :aria-label="usePayable(store, props.reservation) ? amLabels.pay_now_btn : amLabels.paid"
        aria-haspopup="menu"
        :aria-expanded="payPopVisible ? 'true' : 'false'"
        @click="paymentLinkActivated"
        @keydown="onMenuTriggerKeydown"
      >
        {{ usePayable(store, props.reservation) ? amLabels.pay_now_btn : amLabels.paid }}
      </AmButton>
    </template>
    <div
      v-click-outside="closePayPopup"
      class="am-cc__edit"
      role="menu"
      @keydown="onMenuKeydown"
    >
      <AmButton
        v-for="paymentMethod in usePaymentMethods(props.bookable.settings)"
        :key="paymentMethod.value"
        v-click-outside="closePayPopup"
        class="am-cc__edit-item"
        category="secondary"
        type="text"
        role="menuitem"
        :aria-label="paymentMethod.label"
        @click="usePaymentLink(store, paymentMethod.value, props.reservation)"
      >
        <span class="am-cc__edit-text">
          {{ paymentMethod.label }}
        </span>
      </AmButton>
    </div>
  </el-popover>
</template>

<script setup>
// * Import from Vue
import {
  ref,
  computed,
  inject,
  nextTick,
} from "vue";

// * Import from Vuex
import { useStore } from "vuex";

// * Import from Libraries
import { ClickOutside as vClickOutside } from "element-plus";

// * Components
import AmButton from "../../../../_components/button/AmButton.vue";
import IconComponent from "../../../../_components/icons/IconComponent.vue";

// * Composables
import { useColorTransparency } from "../../../../../assets/js/common/colorManipulation";
import {
  usePaymentMethods,
  usePaymentFromCustomerPanel,
  usePaymentLink,
  usePayable,
} from "../../../../../assets/js/public/cabinet";

// * Vars
let store = useStore()

const amLabels = inject('amLabels')

let props = defineProps({
  reservation: {
    type: Object,
    default: () => {}
  },
  bookable: {
    type: Object,
    default: () => {}
  },
  type: {
    type: String,
  },
  btnSize: {
    type: String,
    default: 'mini'
  },
  class: {
    type: String,
    default: ''
  }
})

let paymentMethods = computed(() => {
  return usePaymentMethods(props.bookable.settings)
})

let paymentButtonLoader = computed(() => {
  return store.getters['cabinet/getPaymentLinkLoader']
})

let arrowDown = {
  components: {IconComponent},
  template: `<IconComponent icon="arrow-down"></IconComponent>`
}

let payPopVisible = ref(false)
let menuTriggerRef = ref(null)

function paymentLinkActivated (e) {
  e.stopPropagation()

  if (paymentMethods.value.length === 1) {
    usePaymentLink(store, paymentMethods.value[0].value, props.reservation)
  } else {
    payPopVisible.value = !payPopVisible.value
  }
}

function onMenuTriggerKeydown (e) {
  const openKeys = ['Enter', ' ', 'Spacebar', 'ArrowDown']

  if (paymentMethods.value.length === 1 && openKeys.includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    usePaymentLink(store, paymentMethods.value[0].value, props.reservation)
    return
  }

  if (openKeys.includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    payPopVisible.value = true
    focusFirstMenuItem()
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closePayPopup(true)
  }
}

function getVisibleMenuItems (container = null) {
  const popperRoot = container?.closest('.am-cc__popper') || document.querySelector('.am-cc__popper')

  if (!popperRoot) {
    return []
  }

  return Array.from(popperRoot.querySelectorAll('.am-cc__edit-item'))
    .filter(item => !item.disabled && item.offsetParent !== null)
}

function focusFirstMenuItem () {
  nextTick(() => {
    const firstItem = getVisibleMenuItems()[0]

    if (firstItem) {
      firstItem.focus()
    }
  })
}

function focusMenuTrigger () {
  nextTick(() => {
    const trigger = menuTriggerRef.value?.$el || menuTriggerRef.value

    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus()
    }
  })
}

function onMenuKeydown (e) {
  const menuItems = getVisibleMenuItems(e.currentTarget)

  if (!menuItems.length) {
    return
  }

  const currentIndex = menuItems.indexOf(document.activeElement)

  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closePayPopup(true)
    return
  }

  if (e.key === 'Tab') {
    closePayPopup()
    return
  }

  if (e.key === 'Home') {
    e.preventDefault()
    menuItems[0].focus()
    return
  }

  if (e.key === 'End') {
    e.preventDefault()
    menuItems[menuItems.length - 1].focus()
    return
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()

    const step = e.key === 'ArrowDown' ? 1 : -1
    const fallbackIndex = e.key === 'ArrowDown' ? 0 : menuItems.length - 1
    const nextIndex = currentIndex === -1
      ? fallbackIndex
      : (currentIndex + step + menuItems.length) % menuItems.length

    menuItems[nextIndex].focus()
  }
}

function closePayPopup (focusTrigger = false) {
  payPopVisible.value = false

  if (focusTrigger) {
    focusMenuTrigger()
  }
}

/*************
 * Customize *
 *************/
// * Fonts
let amFonts = inject('amFonts')

// * Colors block
let amColors = inject('amColors')

let cssVars = computed(() => {
  return {
    '--am-c-cc-primary': amColors.value.colorPrimary,
    '--am-c-cc-primary-op70': useColorTransparency(amColors.value.colorPrimary, 0.7),
    '--am-c-cc-error': amColors.value.colorError,
    '--am-c-cc-error-op15': useColorTransparency(amColors.value.colorError, 0.15),
    '--am-c-cc-warning': amColors.value.colorWarning,
    '--am-c-cc-warning-op15': useColorTransparency(amColors.value.colorWarning, 0.15),
    '--am-c-cc-success': amColors.value.colorSuccess,
    '--am-c-cc-success-op15': useColorTransparency(amColors.value.colorSuccess, 0.15),
    '--am-c-cc-bgr': amColors.value.colorMainBgr,
    '--am-c-cc-text': amColors.value.colorMainText,
    '--am-c-cc-text-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
    '--am-c-cc-text-op15': useColorTransparency(amColors.value.colorMainText, 0.15),
    '--am-c-cc-text-op70': useColorTransparency(amColors.value.colorMainText, 0.7),
    '--am-c-cc-text-op90': useColorTransparency(amColors.value.colorMainText, 0.9),
    '--am-font-family': amFonts.value.fontFamily,

    // css properties
    '--am-rad-inp': '6px',
    '--am-fs-inp': '15px',
  }
})
</script>

<script>
export default {
  name: 'PaymentButton'
}
</script>

<style lang="scss">
@mixin collapse-card-popper {
  // cc - collapse card
  .am-cc {
    &__edit {
      &-item {
        display: flex;
        align-items: center;
        color: var(--am-c-cc-text);
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
        transition: background-color .3s ease-in-out;

        &:hover {
          background-color: var(--am-c-cc-text-op15);
        }

        &.am-delete {
          --am-c-cc-text: var(--am-c-cc-error);

          &:hover {
            background-color: var(--am-c-cc-error-op15);
          }
        }

        span[class^="am-icon"] {
          font-size: 24px;
          color: inherit;
          margin: 0 4px 0 0;
        }
      }

      &-text {
        font-size: 14px;
        line-height: 1.7142857;
        color: inherit;
      }
    }
  }

  &.am-cc__popper {
    padding: 6px 4px;
  }
}
</style>
