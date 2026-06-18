<template>
  <div class="am-input-phone-wrapper">
    <MazInputPhoneNumber
      :id="id"
      v-model="model"
      v-model:country-code="countryCode"
      v-bind="forwardedAttrs"
      class="am-input-phone"
      :class="inputClasses"
      :label="label"
      :preferred-countries="preferredCountries"
      :ignored-countries="ignoredCountries"
      :only-countries="onlyCountries"
      :translations="translations"
      :list-position="listPosition"
      :color="color"
      :size="size"
      :hide-flags="hideFlags"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :example="example"
      :search="search"
      :search-threshold="searchThreshold"
      :use-browser-locale="useBrowserLocale"
      :fetch-country="fetchCountry"
      :hide-country-select="hideCountrySelect"
      :show-code-in-list="showCodeInList"
      :custom-countries-list="customCountriesList"
      :auto-format="autoFormat"
      :country-locale="countryLocale"
      :validation-error="validationError"
      :validation-success="validationSuccess"
      :success="success"
      :error="error"
      :display-country-name="displayCountryName"
      :block="block"
      :orientation="orientation"
      :country-select-attributes="countrySelectAttributes"
      :phone-input-attributes="resolvedPhoneInputAttributes"
      :style="cssVars"
      @country-code="handleCountryCode"
      @data="handlePhoneData"

    >
      <template v-if="$slots['no-results']" #no-results>
        <span class="am-input-phone-no-results">
          <slot name="no-results" />
        </span>
      </template>

      <template v-if="$slots['selector-flag']" #selector-flag="slotProps">
        <slot name="selector-flag" v-bind="slotProps" />
      </template>

      <template v-if="$slots['country-list-flag']" #country-list-flag="slotProps">
        <slot name="country-list-flag" v-bind="slotProps" />
      </template>
    </MazInputPhoneNumber>
  </div>
</template>

<script setup>
import { MazInputPhoneNumber } from 'maz-ui/components'
import { computed, inject, useAttrs, onBeforeUnmount, watch } from 'vue'
import { useColorTransparency } from '@/assets/js/common/colorManipulation'

/**
 * Component Props
 */
const props = defineProps({
  modelValue: {
    type: String
  },
  countryCode: {
    type: String,
    default: undefined
  },
  id: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Enter phone'
  },
  label: {
    type: String,
    default: undefined
  },
  preferredCountries: {
    type: Array,
    default: undefined
  },
  ignoredCountries: {
    type: Array,
    default: undefined
  },
  onlyCountries: {
    type: Array,
    default: undefined
  },
  translations: {
    type: Object,
    default: undefined
  },
  listPosition: {
    type: String,
    default: undefined
  },
  color: {
    type: String,
    default: undefined
  },
  size: {
    type: String,
    default: 'md'
  },
  hideFlags: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  example: {
    type: Boolean,
    default: true
  },
  search: {
    type: Boolean,
    default: true
  },
  searchThreshold: {
    type: Number,
    default: 0.75
  },
  useBrowserLocale: {
    type: Boolean,
    default: true
  },
  fetchCountry: {
    type: Boolean,
    default: false
  },
  hideCountrySelect: {
    type: Boolean,
    default: false
  },
  showCodeInList: {
    type: Boolean,
    default: true
  },
  customCountriesList: {
    type: Object,
    default: undefined
  },
  autoFormat: {
    type: [String, Boolean],
    default: 'blur'
  },
  countryLocale: {
    type: String,
    default: undefined
  },
  validationError: {
    type: Boolean,
    default: false
  },
  validationSuccess: {
    type: Boolean,
    default: true
  },
  success: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  displayCountryName: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  orientation: {
    type: String,
    default: 'row'
  },
  countrySelectAttributes: {
    type: Object,
    default: undefined
  },
  phoneInputAttributes: {
    type: Object,
    default: undefined
  }
})

/**
 * Component Emits
 * */
const emits = defineEmits([
  'update:modelValue',
  'country-code',
  'update:countryCode',
  'data'
])

const attrs = useAttrs()

const isRtl = computed(() => typeof document !== 'undefined' && document.documentElement?.dir === 'rtl')

/**
 * Component model
 */
const hasLegacyName = computed(() => typeof props.name === 'string' && props.name.trim() !== '')

const resolvedPhoneInputAttributes = computed(() => {
  const hasPhoneInputAttributes = !!props.phoneInputAttributes

  const resolvedAttributes = {
    autocomplete: 'tel',
    inputmode: 'tel',
    ...(props.phoneInputAttributes || {})
  }

  if (!hasPhoneInputAttributes && !hasLegacyName.value) {
    resolvedAttributes.name = 'phone'
  }

  if (hasLegacyName.value && props.phoneInputAttributes?.name === undefined) {
    resolvedAttributes.name = props.name
  }

  return resolvedAttributes
})

const forwardedAttrs = computed(() => attrs)

const inputClasses = computed(() => ({
  'am-rtl': isRtl.value
}))

const model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val)
  }
})

const countryCode = computed({
  get: () => props.countryCode,
  set: (val) => {
    emits('update:countryCode', val)
  }
})

function handleCountryCode (val) {
  emits('country-code', val)
}

function handlePhoneData (val) {
  emits('data', val)
}

const amColors = inject('amColors')
const cssVars = computed(() => {
  return {
    '--am-c-ph-drop-text-op10': useColorTransparency(amColors.value.colorDropText, 0.1)
  }
})

const cssDropVars = computed(() => {
  return {
    '--am-c-phone-primary': amColors.value.colorPrimary,
    '--am-c-phone-primary-op01': useColorTransparency(amColors.value.colorPrimary, 0.1),
    '--am-c-phone-bgr': amColors.value.colorDropBgr,
    '--am-c-phone-text': amColors.value.colorDropText,
    '--am-c-phone-text-op-60': useColorTransparency(amColors.value.colorDropText, 0.6),
    '--am-c-phone-border': amColors.value.colorDropText,
    '--am-c-phone-hover': useColorTransparency(amColors.value.colorDropText, 0.1),
    '--am-c-phone-input': useColorTransparency(amColors.value.colorDropText, 0.3),
    '--am-c-scroll-op30': useColorTransparency(amColors.value.colorPrimary, 0.30),
    '--am-c-scroll-op10': useColorTransparency(amColors.value.colorPrimary, 0.10),
  }
})

const instanceDropKeys = new Set()

function applyDropdownVars (vars) {
  if (typeof document === 'undefined') {
    return
  }

  Object.entries(vars).forEach(([key, value]) => {
    instanceDropKeys.add(key)
    document.documentElement.style.setProperty(key, value)
  })
}

function clearDropdownVars() {
  if (typeof document === 'undefined') {
    return
  }

  instanceDropKeys.forEach((key) => {
    document.documentElement.style.removeProperty(key)
  })

  instanceDropKeys.clear()
}

const stopDropVarSync = watch(cssDropVars, (vars) => {
  instanceDropKeys.clear()
  Object.keys(vars).forEach((key) => {
    instanceDropKeys.add(key)
  })

  applyDropdownVars(vars)
}, { immediate: true })

onBeforeUnmount(() => {
  stopDropVarSync()
  clearDropdownVars()
})
</script>

<script>
export default {
  inheritAttrs: false
}
</script>

<style lang="scss">
@mixin am-phone-input-block {
  .am-input-phone {
    width: 100%;

    &-wrapper {
      width: 100%;
    }

    // RTL support for v4 component
    &.am-rtl {
      direction: rtl;

      &.m-input-phone-number {
        .m-select-country {
          .m-input-wrapper.--border:first-child {
            border-radius: 0 6px 6px 0;
            padding: 0 12px 0 0;
          }
        }

        .m-phone-input {
          .m-input-wrapper.--border:first-child {
            border-radius: 6px 0 0 6px;
            padding: 0 12px 0 0;
          }
        }
      }
    }

    &.m-input-phone-number {
      // am  - amelia
      // c   - color
      // ph  - phone
      // inp - input
      // bgr - background
      --am-c-ph-inp-bgr: var(--am-c-inp-bgr);
      --am-c-ph-inp-border: var(--am-c-inp-border);
      --am-c-ph-inp-text: var(--am-c-inp-text);
      --am-c-ph-inp-placeholder: var(--am-c-inp-placeholder);

      width: 100%;
      display: flex;
      align-items: stretch;

      // Global reset under #amelia-container sets border: 0 on divs; restore Maz field chrome.
      .m-input-wrapper {
        &.--border {
          background-color: var(--am-c-ph-inp-bgr, hsl(0 0% 100%));
          border: none;
          box-shadow: 0 0 0 1px var(--am-c-ph-inp-border, hsl(220 13.04% 90.98%));
          border-radius: 6px;
          padding: 0;
          font-size: 15px;
          line-height: 1.5;

          &:focus-within {
            --am-c-ph-inp-border: var(--am-c-primary, hsl(220 13.04% 90.98%));
          }

          // First input (country code) - make it narrower
          &:first-child {
            padding: 0 0 0 12px;
            box-sizing: border-box;
          }

          &.maz-border-destructive {
            --am-c-ph-inp-border: var(--am-c-error, #ef4444);
          }
        }

        input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 0;
          font-size: var(--am-fs-inp, 15px);
          font-weight: 400;
          line-height: 24px;
          color: var(--am-c-ph-inp-text, #333);

          &::placeholder {
            color: var(--am-c-ph-inp-placeholder, #999);
          }

          &:focus {
            outline: none;
          }
        }

        button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--am-c-ph-inp-text, #333);

          svg path {
            color: var(--am-c-ph-inp-text, #333);
          }

          &:hover {
            opacity: 0.7;
          }
        }

        &-input {
          height: 40px;
        }
      }

      .m-phone-input {
        width: 100%;
        min-width: unset;

        .m-input-wrapper {
          border-radius: 0 6px 6px 0;
        }
      }

      .m-select-country {
        width: unset !important;

        .m-input-wrapper {
          border-radius: 6px 0 0 6px;

          &-input {
            width: 0;
            height: 0;
            overflow: hidden;
          }

          img {
            width: 20px;
            height: 20px;
            border-radius: 50%;
          }
        }
      }

      .m-popover-container,
      .m-select-list {
        background-color: hsl(var(--maz-background, 0 0% 100%));
      }
    }
  }
}

.m-popover-panel.--surface {
  background-color: transparent !important;
  border-radius: 6px !important;
  border-color: transparent !important;
  color: transparent !important;
  z-index: 100000000 !important;

  .m-select-list {
    background-color: var(--am-c-phone-bgr, hsl(var(--maz-background, 0 0% 100%)));
    color: var(--am-c-phone-text, inherit);
    border-radius: 6px;

    &__scroll-wrapper {
      scrollbar-width: thin;
      scrollbar-color: var(--am-c-scroll-op30) var(--am-c-scroll-op10);

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

    .m-select-list__search-input {
      .m-input-wrapper {
        background-color: transparent;
        border-color: var(--am-c-phone-border, hsl(var(--maz-border, 0 0% 0%)));
        border-radius: 6px;

        svg path {
          color: var(--am-c-phone-text-op-60, hsl(var(--maz-text, 0 0% 0%)));
        }

        &.maz-border-primary {
          border-color: var(--am-c-phone-primary, hsl(220 13.04% 90.98%));
        }

        input {
          color: var(--am-c-phone-text, hsl(var(--maz-text, 0 0% 0%)));

          &::placeholder {
            color: var(--am-c-phone-text-op-60, hsl(var(--maz-text, 0 0% 0%)));
          }
        }
      }
    }

    .m-select-list-item {
      &:hover, &:focus {
        background-color: var(--am-c-phone-hover, hsl(0 0% 0% / 0.05));
      }

      &.--is-selected {
        background-color: var(--am-c-phone-primary-op01, hsl(220 13.04% 90.98% / 0.1));
        color: var(--am-c-phone-primary, hsl(220 13.04% 90.98%));

        &:focus {
          outline-color: var(--am-c-phone-primary, hsl(220 13.04% 90.98%));
        }
      }

      .m-input-phone-number__country-list-code {
        color: var(--am-c-phone-text-op-60, hsl(var(--maz-text, 0 0% 0%)));
      }
    }

    .am-input-phone-no-results {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--am-c-phone-text, hsl(var(--maz-text, 0 0% 0%)));
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
      padding: 0 12px;
      margin: 4px 0 8px;
    }
  }
}

// Public
.amelia-v2-booking #amelia-container {
  @include am-phone-input-block;
}

// Admin
#amelia-app-backend-new {
  @include am-phone-input-block;
}
</style>
