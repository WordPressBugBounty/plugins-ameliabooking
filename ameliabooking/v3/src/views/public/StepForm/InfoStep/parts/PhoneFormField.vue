<template>
  <!-- Phone Number -->
  <el-form-item
    v-if="amCustomize.infoStep.options.phone.visibility"
    ref="primeFieldRef"
    class="am-fs__info-form__item"
    prop="phone"
    label-position="top"
    style="z-index: 10"
    :style="cssVars"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.phone_colon }}
      </span>
    </template>
    <AmInputPhone
      :key="`phone-${countryCode}-${props.refreshTrigger}`"
      v-model="model"
      v-model:country-code="countryCode"
      :placeholder="amLabels.enter_phone"
      :validation-error="true"
      :error="props.phoneError"
      :phone-input-attributes="{ name: 'phone' }"
      style="position: relative"
      @data="handleData"
    >
      <template #no-results>
        {{ amLabels.no_results_found }}
      </template>
    </AmInputPhone>
    <template #error v-if="props.errorMessage">
      <span class="el-form-item__error">
        {{ props.errorMessage }}
      </span>
    </template>
    <div v-if="whatsAppSetUp() && !props.phoneError" class="am-whatsapp-opt-in-text">
      {{ amLabels.whatsapp_opt_in_text }}
    </div>
  </el-form-item>
  <!-- /Phone Number -->
</template>

<script setup>
import AmInputPhone from '../../../../_components/input-phone/AmInputPhone.vue'
import { settings } from "../../../../../plugins/settings";

// * Vue
import {
  computed,
  inject,
  ref,
} from "vue";

// * Composables
import {
  useColorTransparency
} from "../../../../../assets/js/common/colorManipulation";

// * Emits

// * Props
let props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  countryCode: {
    type: String,
    default: ''
  },
  phoneError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  refreshTrigger: {
    type: Number,
    default: 0
  }
})

let emits = defineEmits([
  'update:modelValue',
  'update:countryCode',
  'handlePhoneData'
])

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

// * Colors
let amColors = inject('amColors')
let cssVars = computed(() => {
  return {
    // is - Info Step, wa - WhatsApp
    '--am-c-is-wa-text': useColorTransparency(amColors.value.colorMainText, 0.5),
    'margin-bottom': whatsAppSetUp() && !props.phoneError ? '10px' : '24px'
  }
})

let primeFieldRef = ref(null)

// * Labels
let amLabels = inject('amLabels')

// * Customize
let amCustomize = inject('amCustomize')

function whatsAppSetUp () {
  return settings.notifications.whatsAppEnabled
}

function handleData(val) {
  emits('handlePhoneData', val)
}

defineExpose({
  primeFieldRef
})
</script>

<script>
export default {
  name: "PhoneFormField"
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    .am-fs__info-form__item, .am-elfci__item {
      .am-whatsapp-opt-in-text {
        color: var(--am-c-is-wa-text);
        font-weight: 400;
        font-size: 10px;
        line-height: 16px;
        word-break: break-word;
      }
    }
  }
}

</style>
