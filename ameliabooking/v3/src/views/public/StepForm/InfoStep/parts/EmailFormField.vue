<template>
  <!-- Email -->
  <el-form-item
    v-if="amCustomize.infoStep.options.email.visibility"
    ref="primeFieldRef"
    class="am-fs__info-form__item am-info-email"
    prop="email"
    label-position="top"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.email_colon }}
      </span>
    </template>
    <AmInput
      v-model="model"
      name="email"
      type="email"
      :placeholder="amLabels.enter_email"
    />
  </el-form-item>
  <!-- /Email -->
</template>

<script setup>
import AmInput from'../../../../_components/input/AmInput.vue'

import {inject, ref, computed} from "vue";

let props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

let emits = defineEmits(['update:modelValue'])

let model = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val)
  }
})

let primeFieldRef = ref(null)

// * Labels
let amLabels = inject('amLabels')

// * Customize
let amCustomize = inject('amCustomize')

defineExpose({
  primeFieldRef
})
</script>

<script>
export default {
  name: "EmailFormField"
}
</script>
