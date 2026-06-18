<template>
  <!--Last Name -->
  <el-form-item
    v-if="amCustomize.infoStep.options.lastName.visibility"
    ref="primeFieldRef"
    class="am-fs__info-form__item am-info-last-name"
    prop="lastName"
    label-position="top"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.last_name_colon }}
      </span>
    </template>
    <AmInput
      v-model="model"
      name="lastName"
      :placeholder="amLabels.enter_last_name"
    />
  </el-form-item>
  <!-- /Last Name -->
</template>

<script setup>
import AmInput from'../../../../_components/input/AmInput.vue'

import {inject, ref, computed} from "vue" ;

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
  name: "LastNameFormField"
}
</script>
