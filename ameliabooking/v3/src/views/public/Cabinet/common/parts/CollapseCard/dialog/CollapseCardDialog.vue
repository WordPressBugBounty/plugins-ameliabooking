<template>
  <div
    class="am-collapse-card-dialog__trigger"
    tabindex="0"
    role="button"
    @click="open"
    @keydown.enter="open"
    @keydown.space.prevent="open"
  >
    <slot name="trigger"></slot>
  </div>

  <Teleport v-if="activeComponent" :to="props.appendDialogTo">
    <AmSlidePopup
      ref="collapseCardDialogRef"
      :visibility="visibility"
      position="center"
      :close-outside="true"
      custom-class="am-collapse-card-dialog"
      :style="cssVars"
      :aria-label="activeComponent.headerText"
      @update:visibility="onVisibilityUpdate"
      @onClose="emits('onClose')"
    >
      <template #header>
        {{ activeComponent.headerText }}
      </template>
      <template #default>
        <div
          ref="contentRef"
          class="am-collapse-card-dialog__content"
          :class="{ 'am-collapse-card-dialog__content--scrollable': isScrollable }"
        >
          <component
            :is="activeComponent.template"
            v-if="visibility && activeComponent.template"
            v-bind="activeComponent.props"
          />
        </div>
      </template>
    </AmSlidePopup>
  </Teleport>
</template>

<script setup>
// * Import from Vue
import { ref, computed, markRaw, watch, nextTick, inject } from 'vue'

// * Import from VueUse
import { useElementSize, useResizeObserver, useMutationObserver } from '@vueuse/core'

// * Import from common
import { useResponsiveClass } from '../../../../../../../assets/js/common/responsive'
import { useColorTransparency } from '../../../../../../../assets/js/common/colorManipulation'

// * Components
import AmSlidePopup from '../../../../../../_components/slide-popup/AmSlidePopup.vue'

// * Templates
import CustomFields from './templates/CustomFields.vue'

// * Props
let props = defineProps({
  appendDialogTo: {
    type: String,
    default: 'body',
  },
  visibility: {
    type: Boolean,
    default: undefined,
  },
  componentName: {
    required: true,
    type: String,
    default: '',
  },
  contentData: {
    required: true,
    type: Array,
    default: () => [],
  },
  customizedOptions: {
    type: Object,
    default: () => ({}),
  },
})

// * Emits
let emits = defineEmits(['update:visibility', 'onClose'])

// * Labels
const amLabels = inject('amLabels')

// * Fonts
let amFonts = inject('amFonts')

// * Colors block
let amColors = inject('amColors')

// * Css Variables
// The dialog is teleported outside of the panel, so it can not inherit the panel css variables
let cssVars = computed(() => {
  return {
    '--am-c-primary': amColors.value.colorPrimary,
    '--am-c-main-bgr': amColors.value.colorMainBgr,
    '--am-c-main-text': amColors.value.colorMainText,
    '--am-c-error': amColors.value.colorError,
    '--am-c-inp-bgr': amColors.value.colorInpBgr,
    '--am-c-inp-border': amColors.value.colorInpBorder,
    '--am-c-inp-text': amColors.value.colorInpText,
    '--am-c-inp-placeholder': amColors.value.colorInpPlaceHolder,
    '--am-c-drop-bgr': amColors.value.colorDropBgr,
    '--am-c-drop-text': amColors.value.colorDropText,
    '--am-c-scroll-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
    '--am-c-scroll-op30': useColorTransparency(amColors.value.colorMainText, 0.3),
    '--am-c-cust-text': amColors.value.colorMainText,
    '--am-c-cust-link': useColorTransparency(amColors.value.colorMainText, 0.5),
    '--am-c-cust-no1': amColors.value.colorMainText,
    '--am-c-cust-no1-bgr': useColorTransparency(amColors.value.colorMainText, 0.1),
    '--am-c-cust-no2': amColors.value.colorWarning,
    '--am-c-cust-no2-bgr': useColorTransparency(amColors.value.colorWarning, 0.1),
    '--am-c-cust-no3': amColors.value.colorError,
    '--am-c-cust-no3-bgr': useColorTransparency(amColors.value.colorError, 0.1),
    '--am-font-family': amFonts.value.fontFamily,

    // css properties
    '--am-rad-inp': '6px',
    '--am-fs-inp': '15px',
  }
})

let internalVisibility = ref(false)
let visibility = computed({
  get: () => (props.visibility !== undefined ? props.visibility : internalVisibility.value),
  set: (value) => {
    if (props.visibility === undefined) {
      internalVisibility.value = value
    }
    emits('update:visibility', value)
  },
})

function open() {
  visibility.value = true
}

function onVisibilityUpdate(value) {
  visibility.value = value
}

let collapseCardDialogRef = ref(null)
let dialogEl = computed(() => collapseCardDialogRef.value?.dialogRef ?? null)

let { width: collapseCardDialogWidth } = useElementSize(dialogEl)

let responsiveClass = computed(() => {
  return useResponsiveClass(collapseCardDialogWidth.value)
})

let components = computed(() => ({
  customField: {
    template: markRaw(CustomFields),
    headerText: amLabels.value.custom_fields,
    props: {
      data: props.contentData,
      responsiveClass: responsiveClass.value,
      customizedOptions: props.customizedOptions,
    },
  },
}))

let activeComponent = computed(() => {
  if (!props.componentName) return null

  return components.value[props.componentName] ?? null
})

const contentRef = ref(null)
const isScrollable = ref(false)

function checkScrollable() {
  const el = contentRef.value
  if (!el) {
    isScrollable.value = false
    return
  }
  isScrollable.value = el.scrollHeight > el.clientHeight
}

useResizeObserver(contentRef, checkScrollable)
useMutationObserver(contentRef, checkScrollable, {
  childList: true,
  subtree: true,
  characterData: true,
})

watch(
  () => visibility.value,
  async (open) => {
    if (!open) return
    await nextTick()
    checkScrollable()
  },
)
</script>

<script>
export default {
  name: 'CollapseCardDialog',
}
</script>

<style lang="scss">
@mixin am-collapse-card-dialog {
  .am-collapse-card-dialog__trigger {
    &:focus-visible {
      outline: 2px solid var(--am-c-primary, #1246d6);
      outline-offset: 2px;
      border-radius: 4px;
    }
  }

  .am-slide-popup__block-inner.am-position-center {
    &.am-collapse-card-dialog {
      width: 90%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 8px;
      padding: 0 24px 0 0;

      .am-slide-popup__block {
        &-header {
          padding: 20px 0 24px 24px;
          gap: 24px;
          font-size: 18px;
          font-style: normal;
          font-weight: 500;
          line-height: 28px;
          color: var(--am-c-main-text);
        }
      }

      .am-collapse-card-dialog {
        &__content {
          overflow-x: hidden;
          overflow-y: auto;
          min-height: 400px;
          padding: 0 0 24px 24px;
          background-color: var(--am-c-main-bgr);

          &--scrollable {
            padding-right: 6px;
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
  }
}
// public
.amelia-v2-booking #amelia-container {
  @include am-collapse-card-dialog;
}
</style>
