<script setup>
import AmDialog from '../../_components/dialog/AmDialog.vue'

import SbsForm from '../StepForm/BookingStepForm.vue'
import CbfForm from '../CatalogForm/CatalogForm.vue'
import ElfForm from '../EventForm/EventListForm/EventsListForm.vue'
import EcfForm from '../EventForm/EventCalendarForm/EvensCalendarForm.vue'

import { useColorTransparency } from '../../../assets/js/common/colorManipulation'

// * Import from Vue
import { markRaw, reactive, ref, inject, computed, onMounted, watchEffect, provide } from 'vue'

// * Import composables
import { defaultCustomizeSettings } from '../../../assets/js/common/defaultCustomize'
import { useRenderAction } from '../../../assets/js/public/renderActions'

// * Shortcode Data
let shortcodeData = inject('shortcodeData')

// * List of forms
let formList = reactive({
  sbsNew: markRaw(SbsForm),
  cbf: markRaw(CbfForm),
  elf: markRaw(ElfForm),
  ecf: markRaw(EcfForm),
})

let dialogWrapperWidth = ref(0)
provide('dialogWrapperWidth', dialogWrapperWidth)

let dialogVisibility = ref(false)
provide('formDialogVisibility', dialogVisibility)

let isRestored = computed(() =>
  'isRestored' in shortcodeData.value ? shortcodeData.value.isRestored : false,
)

let externalButtons =
  shortcodeData.value.trigger_type && shortcodeData.value.trigger_type === 'class'
    ? [...document.getElementsByClassName(shortcodeData.value.trigger)]
    : [document.getElementById(shortcodeData.value.trigger)]

let resizeAfter = ref(100)

let loadDialogCounter = ref(0)
provide('loadDialogCounter', loadDialogCounter)

externalButtons.forEach((btn) => {
  btn.addEventListener('click', (a) => {
    a.preventDefault()
    a.stopPropagation()
    dialogVisibility.value = true

    if (!isRestored.value) {
      loadDialogCounter.value++
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, resizeAfter.value)
  })
})

watchEffect(() => {
  if (isRestored.value) {
    externalButtons.forEach((btn) => {
      btn.dispatchEvent(new Event('click'))
    })
  }
})

function resetDialogState() {
  dialogVisibility.value = false
}

let dynamicVh = ref(0)
function updateVH() {
  dynamicVh.value = window.visualViewport.height
}

window.addEventListener('resize', updateVH)

// * Global flag for determination when component is fully loaded (used for Amelia popup)
let isMounted = inject('isMounted')

onMounted(() => {
  isMounted.value = true

  useRenderAction('renderPopup', {
    resizeAfter,
  })

  updateVH()
})

// * Root Settings
const amSettings = inject('settings')

// * Colors block
let amColors = computed(() => {
  return amSettings.customizedData &&
    shortcodeData.value.triggered_form in amSettings.customizedData
    ? amSettings.customizedData[shortcodeData.value.triggered_form].colors
    : defaultCustomizeSettings[shortcodeData.value.triggered_form].colors
})

let formData = computed(() => {
  return amSettings.customizedData &&
    shortcodeData.value.triggered_form in amSettings.customizedData
    ? amSettings.customizedData[shortcodeData.value.triggered_form]
    : defaultCustomizeSettings[shortcodeData.value.triggered_form]
})

let cssVars = computed(() => {
  return {
    '--am-c-primary': amColors.value.colorPrimary,
    '--am-c-success': amColors.value.colorSuccess,
    '--am-c-error': amColors.value.colorError,
    '--am-c-warning': amColors.value.colorWarning,
    '--am-c-main-bgr': amColors.value.colorMainBgr,
    '--am-c-main-heading-text': amColors.value.colorMainHeadingText,
    '--am-c-main-text': amColors.value.colorMainText,
    '--am-dvh': dynamicVh.value ? `${dynamicVh.value}px` : '100dvh',
    '--am-c-scroll-op30': useColorTransparency(amColors.value.colorPrimary, 0.3),
    '--am-c-scroll-op10': useColorTransparency(amColors.value.colorPrimary, 0.1),
  }
})

const dialogTitles = {
  sbsNew: 'Appointment Booking',
  cbf: 'Catalog Booking',
  elf: 'Event Booking',
  ecf: 'Event Calendar Booking',
}

let dialogTitle = computed(() => {
  return dialogTitles[shortcodeData.value.triggered_form] || 'Booking'
})

watchEffect(
  () => {
    if (shortcodeData.value.triggered_form === 'sbsNew') {
      dialogWrapperWidth.value = formData.value.sidebar.options.self.visibility ? '760px' : '520px'
    }

    if (shortcodeData.value.triggered_form === 'cbf') {
      dialogWrapperWidth.value = '1140px'
    }

    if (shortcodeData.value.triggered_form === 'elf') {
      dialogWrapperWidth.value = '792px'
    }
  },
  { flush: 'post' },
)
</script>

<script>
export default {
  name: 'AmeliaDialogForms',
}
</script>

<template>
  <AmDialog
    v-model="dialogVisibility"
    :append-to-body="true"
    :modal-class="`amelia-v2-booking am-forms-dialog am-${shortcodeData.triggered_form}`"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :custom-styles="cssVars"
    :used-for-shortcode="true"
    :width="dialogWrapperWidth"
    @closed="resetDialogState"
  >
    <template #title>
      <span class="am-sr-only">{{ dialogTitle }}</span>
    </template>
    <component :is="formList[shortcodeData.triggered_form]"></component>
  </AmDialog>
</template>

<style lang="scss">
.amelia-v2-booking {
  &.am-forms-dialog {
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999999 !important;

    &.am-cbf {
      .el-dialog {
        margin-top: 32px;
        overflow: visible;

        @media only screen and (max-width: 768px) {
          overflow: hidden;
        }

        .el-dialog__headerbtn {
          top: -28px;
          right: 0;
          background-color: var(--am-c-main-bgr) !important;
          border-radius: 50%;

          @media only screen and (max-width: 768px) {
            top: 16px;
            right: 16px;
          }
        }
      }
    }

    .el-dialog {
      box-shadow: none;
      border-radius: 8px;

      @media only screen and (max-width: 768px) {
        margin-top: 0;
        width: 100%;
        max-width: 100%;

        #amelia-container {
          &.am-fs {
            &__wrapper {
              max-height: unset;
              height: var(--am-dvh, 100vh);
            }
          }

          .am-fs {
            &-sb {
              &__step-wrapper {
                height: calc(var(--am-dvh, 100vh) - 182px);
              }
            }

            &__main-content {
              height: calc(var(--am-dvh, 100vh) - 118px);
            }
          }

          .am-els {
            &__wrapper {
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

      // * Dialog Header
      &.am-dialog--with-header {
        .el-dialog__header {
          height: 0;
          min-height: 0;
        }
      }

      // * Dialog Body
      .el-dialog__body {
        padding: 0;

        // Main Scroll styles
        &::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

      &__footer {
        display: none;
      }
    }

    #amelia-container {
      * {
        font-family: var(--am-font-family), sans-serif;
        box-sizing: border-box;
        word-break: break-word;
      }

      &.am-fs {
        &__wrapper {
          margin: 0;
        }
      }
    }
  }
}
</style>
