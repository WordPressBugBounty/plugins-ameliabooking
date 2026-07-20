<template>
  <el-dialog
    ref="amDialogRef"
    v-model="model"
    :modal-class="`am-dialog-popup ${props.modalClass}`"
    :class="[props.customClass, { 'am-dialog--with-header': hasHeaderContent }]"
    :title="props.title"
    :width="props.width"
    :fullscreen="props.fullscreen"
    :top="props.top"
    :modal="props.modal"
    :append-to-body="props.appendToBody"
    :append-to="props.appendTo"
    :lock-scroll="props.lockScroll"
    :open-delay="props.openDelay"
    :close-delay="props.closeDelay"
    :close-on-click-modal="props.closeOnClickModal"
    :close-on-press-escape="props.closeOnPressEscape"
    :show-close="props.showClose"
    :before-close="props.beforeClose"
    :center="props.center"
    :align-center="props.alignCenter"
    :destroy-on-close="props.destroyOnClose"
    :close-icon="props.closeIcon"
    :draggable="props.draggable"
    :overflow="props.overflow"
    :z-index="props.zIndex"
    :header-class="props.headerClass"
    :body-class="props.bodyClass"
    :footer-class="props.footerClass"
    :style="props.customStyles"
    @close="emits('close')"
    @open="emits('open')"
    @closed="emits('closed')"
    @opened="emits('opened')"
    @open-auto-focus="emits('open-auto-focus', $event)"
    @close-auto-focus="emits('close-auto-focus', $event)"
  >
    <template #header="{ titleId, titleClass }">
      <slot name="header" />
      <span v-if="title" :id="titleId" :class="[titleClass, 'am-dialog__title']">{{ title }}</span>
      <span v-else :id="titleId" :class="titleClass">
        <slot name="title" />
      </span>
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import AmeliaIconClose from '../icons/IconClose.vue'

// * Import from Vue
import { toRefs, computed, ref, onMounted, useSlots } from 'vue'

/**
 * Component Props
 */
const props = defineProps({
  modelValue: {
    type: [String, Array, Object, Number, Boolean],
  },
  modalClass: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: '50%',
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  top: {
    type: String,
    default: '15vh',
  },
  modal: {
    type: Boolean,
    default: true,
  },
  appendToBody: {
    type: Boolean,
    default: false,
  },
  appendTo: {
    type: [String, Object],
    default: undefined,
  },
  alignCenter: {
    type: Boolean,
    default: true,
  },
  lockScroll: {
    type: Boolean,
    default: true,
  },
  customClass: {
    type: String,
    default: '',
  },
  openDelay: {
    type: Number,
    default: 0,
  },
  closeDelay: {
    type: Number,
    default: 0,
  },
  closeOnClickModal: {
    type: Boolean,
    default: true,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  beforeClose: {
    type: Function,
  },
  center: {
    type: Boolean,
    default: false,
  },
  destroyOnClose: {
    type: Boolean,
    default: false,
  },
  closeIcon: {
    type: [Object, Function],
    default: AmeliaIconClose,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  overflow: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: Number,
    default: undefined,
  },
  headerClass: {
    type: String,
    default: '',
  },
  bodyClass: {
    type: String,
    default: '',
  },
  footerClass: {
    type: String,
    default: '',
  },
  customStyles: {
    type: Object,
  },
  usedForShortcode: {
    type: Boolean,
    default: false,
  },
})

const amDialogRef = ref(null)
const slots = useSlots()

const hasHeaderContent = computed(() => {
  return Boolean(props.title || slots.header || slots.title)
})

onMounted(() => {
  if (props.usedForShortcode) {
    amDialogRef.value.rendered = true
  }
})

/**
 * Component Emits
 * */
const emits = defineEmits([
  'close',
  'open',
  'closed',
  'opened',
  'open-auto-focus',
  'close-auto-focus',
  'update:modelValue',
])

/**
 * Component model
 */
let { modelValue } = toRefs(props)

let model = computed({
  get: () => modelValue.value,
  set: (val) => {
    emits('update:modelValue', val)
  },
})
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style lang="scss">
.am-dialog-popup {
  .el-overlay-dialog {
    overflow: hidden;
  }

  @media only screen and (max-width: 768px) {
    .el-overlay-dialog {
      display: flex !important;
      align-items: stretch !important;
      height: 100%;
    }
  }

  .el-dialog {
    max-width: var(--el-dialog-width, 50%);
    width: 100%;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--am-c-main-bgr);
    display: flex;
    flex-direction: column;
    max-height: calc(var(--am-dvh, 100dvh) - 80px);

    &__header {
      padding: 0 24px;
      min-height: 60px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: var(--am-c-main-bgr);
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 3px var(--am-c-main-text-op15, rgba(26, 44, 55, 0.15));
    }

    &.am-dialog--with-header .el-dialog__header {
      height: 60px;
    }

    &__headerbtn {
      top: 16px;
      right: 16px;
      width: 24px;
      height: 24px;
      background: transparent !important;
      padding: 0;
      z-index: 3;

      &:focus {
        outline: 1px solid var(--am-c-main-text);
      }

      &:active {
        position: absolute;
        border: none;
        outline: 0;
      }
    }

    &__close {
      .am-icon-close:before {
        color: var(--am-c-main-text);
      }
    }

    &__body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 16px 24px 24px;
    }

    &__footer {
      flex-shrink: 0;
      position: sticky;
      bottom: 0;
      z-index: 2;
      padding: 16px;
      background-color: var(--am-c-main-bgr);
      box-shadow: 0 -2px 3px var(--am-c-main-text-op15, rgba(26, 44, 55, 0.15));
    }

    @media only screen and (max-width: 768px) {
      height: var(--am-dvh, 100dvh);
      max-height: var(--am-dvh, 100dvh);
      margin: 0 !important;
      max-width: 100% !important;
      border-radius: 0;

      &.is-align-center {
        margin: 0 !important;
      }
    }
  }
}
</style>
