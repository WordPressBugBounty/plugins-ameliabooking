<template>
  <el-dialog
    ref="amDialogRef"
    v-model="model"
    :modal-class="`am-dialog-popup ${props.modalClass}`"
    :class="props.customClass"
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
    <template #header>
      <span v-if="title" class="am-dialog__title">{{ title }}</span>
      <slot v-else name="title" />
    </template>
    <slot />
    <template #footer>
      <slot name="footer"/>
    </template>
  </el-dialog>
</template>

<script setup>
import AmeliaIconClose from '../icons/IconClose.vue'

// * Import from Vue
import {
  toRefs,
  computed,
  ref,
  onMounted
} from "vue";

/**
 * Component Props
 */
const props = defineProps({
  modelValue: {
    type: [String, Array, Object, Number, Boolean],
  },
  modalClass: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '50%'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  top: {
    type: String,
    default: '15vh'
  },
  modal: {
    type: Boolean,
    default: true
  },
  appendToBody: {
    type: Boolean,
    default: false
  },
  appendTo: {
    type: [String, Object],
    default: undefined
  },
  alignCenter: {
    type: Boolean,
    default: true
  },
  lockScroll: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  },
  openDelay: {
    type: Number,
    default: 0
  },
  closeDelay: {
    type: Number,
    default: 0
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  beforeClose: {
    type: Function
  },
  center: {
    type: Boolean,
    default: false
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  closeIcon: {
    type: [Object, Function],
    default: AmeliaIconClose
  },
  draggable: {
    type: Boolean,
    default: false
  },
  overflow: {
    type: Boolean,
    default: false
  },
  zIndex: {
    type: Number,
    default: undefined
  },
  headerClass: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  },
  footerClass: {
    type: String,
    default: ''
  },
  customStyles: {
    type: Object
  },
  usedForShortcode: {
    type: Boolean,
    default: false
  }
})

const amDialogRef = ref(null)

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
  'update:modelValue'
])

/**
 * Component model
 */
let { modelValue } = toRefs(props)
let model = computed({
  get: () => modelValue.value,
  set: (val) => {
    emits('update:modelValue', val)
  }
})

</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style lang="scss">
@import '../../../../src/assets/scss/common/quill/quill';

.am-dialog-popup {
  .el-dialog {
    max-width: var(--el-dialog-width, 50%);
    width: 100%;
    padding: 0;

    .el-dialog {
      &__header {
        padding: 16px;
      }

      &__headerbtn {
        width: auto;
        height: auto;

        &:focus {
          outline: 1px solid var(--am-c-main-text);
        }
      }

      &__body {
        padding: 16px;
      }

      &__footer {
        padding: 16px;
      }
    }
  }
}
</style>
