<template>
  <div
    ref="triggerRef"
    class="am-collapse-card-dialog__trigger"
    tabindex="0"
    role="button"
    @click="open"
    @keydown.enter="open"
    @keydown.space.prevent="open"
  >
    <slot name="trigger"></slot>
  </div>

  <Teleport v-if="activeComponent && teleportTarget" :to="teleportTarget">
    <AmSlidePopup
      ref="collapseCardDialogRef"
      :visibility="visibility"
      position="center"
      :close-outside="true"
      custom-class="am-collapse-card-dialog"
      :style="cssVars"
      :aria-label="props.headerText"
      @update:visibility="onVisibilityUpdate"
    >
      <template #header>
        {{ props.headerText }}
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
import { ref, computed, markRaw, watch, nextTick, inject, provide, onMounted } from 'vue'

// * Import from VueUse
import { useElementSize, useResizeObserver, useMutationObserver } from '@vueuse/core'

// * Composables
import { useResponsiveClass } from '../../../../../../../../../assets/js/common/responsive'
import { useColorTransparency } from '../../../../../../../../../assets/js/common/colorManipulation'

// * Components
import AmSlidePopup from '../../../../../../../../_components/slide-popup/AmSlidePopup.vue'

// * Templates (reused from public - see CollapseCardDialog's shortcodeData/noShowData shim below)
import CustomFields from '../../../../../../../../public/Cabinet/common/parts/CollapseCard/dialog/templates/CustomFields.vue'

// * Props
let props = defineProps({
  appendDialogTo: {
    type: String,
    default: 'body',
  },
  headerText: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    required: true,
  },
  contentData: {
    type: Array,
    default: () => [],
  },
  customizedOptions: {
    type: Object,
    default: () => ({}),
  },
})

let visibility = ref(false)

let triggerRef = ref(null)
let teleportTarget = ref(null)

// The customize preview is rendered inside a shadow root, so the dialog target
// cannot be found through `document` - it is looked up in the component's own
// root node instead.
function resolveTeleportTarget() {
  const root = triggerRef.value?.getRootNode() ?? document

  teleportTarget.value =
    root.querySelector(props.appendDialogTo) ??
    root.querySelector('#amelia-app-backend-new') ??
    document.body
}

onMounted(resolveTeleportTarget)

function open() {
  resolveTeleportTarget()
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
    props: {
      data: props.contentData,
      responsiveClass: responsiveClass.value,
      customizedOptions: props.customizedOptions,
    },
  },
}))

let activeComponent = computed(() => {
  if (!props.type) return null

  return components.value[props.type] ?? null
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
  async (opened) => {
    if (!opened) return
    await nextTick()
    checkScrollable()
  },
)

/*************
 * Customize *
 *************/
// * Panel that renders the preview (cape - employee panel, capc - customer panel)
const pageRenderKey = inject('pageRenderKey')

// * The reused public CustomFields template expects `shortcodeData`/`noShowData` -
// * shim them from customize's own context so its behavior stays unchanged.
provide(
  'shortcodeData',
  computed(() => ({ cabinetType: pageRenderKey.value === 'cape' ? 'employee' : 'customer' })),
)

function noShowData(noShowCount) {
  if (noShowCount) {
    if (noShowCount === 1) {
      return { class: 'am-no-show-1', icon: 'no-show-1' }
    }

    if (noShowCount === 2) {
      return { class: 'am-no-show-2', icon: 'no-show-2' }
    }

    if (noShowCount > 2) {
      return { class: 'am-no-show-3', icon: 'no-show-3' }
    }
  }

  return { class: '', icon: '' }
}

provide('noShowData', { noShowData })

// * Fonts
let amFonts = inject('amFonts')

// * Colors block
let amColors = inject('amColors')

let cssVars = computed(() => {
  return {
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

#amelia-app-backend-new #amelia-container {
  @include am-collapse-card-dialog;
}
</style>
