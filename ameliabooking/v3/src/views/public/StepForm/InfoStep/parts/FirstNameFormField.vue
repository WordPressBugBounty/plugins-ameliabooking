<template>
  <!-- First Name -->
  <el-form-item
    ref="primeFieldRef"
    class="am-fs__info-form__item am-info-first-name"
    prop="firstName"
    label-position="top"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.first_name_colon }}
      </span>
    </template>
    <AmInput
      v-model="model"
      name="firstName"
      :placeholder="amLabels.enter_first_name"
    />
  </el-form-item>
  <!-- /First Name -->
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

let amLabels = inject('amLabels')

defineExpose({
  primeFieldRef
})
</script>

<script>
export default {
  name: "FirstNameFormField"
}
</script>
