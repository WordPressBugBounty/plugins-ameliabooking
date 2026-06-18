<template>
  <!-- Phone Number -->
  <el-form-item
    v-if="amCustomize[pageRenderKey].infoStep.options.phone.visibility"
    class="am-fs__info-form__item"
    prop="phone"
    label-position="top"
    style="z-index: 10"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ labelsDisplay('phone_colon') }}
      </span>
    </template>
    <AmInputPhone
      v-model="infoFormData.phone"
      v-model:country-code="countryCode"
      :placeholder="labelsDisplay('enter_phone')"
      :validation-error="true"
      :phone-input-attributes="{ name: 'phone' }"
      style="position: relative"
      @data="handleData"
    >
      <template #no-results>
        {{ labelsDisplay('no_results_found') }}
      </template>
    </AmInputPhone>
  </el-form-item>
  <!-- /Phone Number -->
</template>

<script setup>
import AmInputPhone from '../../../_components/input-phone/AmInputPhone.vue'
import { useReactiveCustomize } from '../../../../assets/js/admin/useReactiveCustomize.js'

import { computed, inject, ref } from 'vue'

let langKey = inject('langKey')
let amLabels = inject('labels')

let pageRenderKey = inject('pageRenderKey')
const { amCustomize } = useReactiveCustomize()

const amSettings = inject('settings')

// * Label computed function
function labelsDisplay(label) {
  let computedLabel = computed(() => {
    return amCustomize.value[pageRenderKey.value].infoStep.translations &&
      amCustomize.value[pageRenderKey.value].infoStep.translations[label] &&
      amCustomize.value[pageRenderKey.value].infoStep.translations[label][
        langKey.value
      ]
      ? amCustomize.value[pageRenderKey.value].infoStep.translations[label][
          langKey.value
        ]
      : amLabels[label]
  })

  return computedLabel.value
}

// * Form field data
let infoFormData = inject('infoFormData')

let countryCode = ref(amSettings.general.phoneDefaultCountryCode === 'auto' ? '' : amSettings.general.phoneDefaultCountryCode.toLowerCase())

function handleData(phoneData) {
  infoFormData.value.phone = phoneData && typeof phoneData.formatNational === 'string' ? phoneData.formatNational.replace(/\s+/g, '') : ''
}
</script>

<script>
export default {
  name: 'PhoneFormField',
}
</script>
