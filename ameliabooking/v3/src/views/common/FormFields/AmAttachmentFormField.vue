<template>
  <el-form-item
    v-if="props.isUpload"
    :id="props.id"
    ref="formFieldRef"
    class="am-ff__item"
    :prop="props.itemName"
    :label-position="props.labelPosition"
  >
    <template #label>
      <span class="am-ff__item-label" v-html="props.label" />
    </template>
    <AmAttachment
      :id="props.id"
      v-model="model"
      :auto-upload="false"
      :accept="customFieldsAllowedExtensions"
      @change="onAddFile"
      @remove="onRemoveFile"
    >
      {{ props.btnLabel }}
    </AmAttachment>
  </el-form-item>
  <div v-else class="am-ff__item-files" :style="cssVars">
    <div v-for="(fileInfo, index) in props.modelValue" :key="index" class="am-ff__item-file">
      <div class="am-ff__item-file-icon">
        <span class="am-icon-attachment" aria-hidden="true"></span>
      </div>
      <div class="am-ff__item-file-info">
        <div class="am-ff__item-file-info-name">
          {{ fileInfo.name }}
        </div>
        <div v-if="fileInfo.size" class="am-ff__item-file-info-size">
          {{ fileInfo.size }}
        </div>
      </div>
      <a
        class="am-ff__item-file-download"
        :href="
          ajaxUrl +
          '/fields/' +
          props.id +
          '/' +
          props.bookingId +
          '/' +
          index +
          '&source=' +
          props.source
        "
        target="_blank"
        :aria-label="`${amLabels.download || 'Download'} ${fileInfo.name}`"
      >
        <span class="am-icon-download" aria-hidden="true"></span>
      </a>
    </div>
  </div>
</template>

<script setup>
// * _components
import AmAttachment from '../../_components/attachment/AmAttachment.vue'

// * Import from Vue
import { computed, inject, onMounted, ref, toRefs } from 'vue'
import { settings } from '../../../plugins/settings'

import { useColorTransparency } from '../../../assets/js/common/colorManipulation.js'

// * Import from Vuex
import { useStore } from 'vuex'

// * Form Item Props
let props = defineProps({
  modelValue: {
    type: [String, Array, Object, Number],
    required: true,
  },
  id: {
    type: [String, Number],
  },
  bookingId: {
    type: [String, Number],
  },
  itemName: {
    type: String,
    required: true,
  },
  isUpload: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
  },
  labelPosition: {
    type: String,
    default: 'top',
  },
  btnLabel: {
    type: String,
  },
  source: {
    type: String,
    default: 'cabinet-provider',
  },
})

// * Define Emits
const emits = defineEmits(['update:modelValue', 'change', 'remove'])

const store = useStore()

let ajaxUrl = computed(() => store.getters['getBaseUrls'].wpAmeliaPluginAjaxURL)

const amLabels = inject('labels', {})

// * Component model
let { modelValue } = toRefs(props)
let model = computed({
  get: () => modelValue.value,
  set: (val) => {
    emits('update:modelValue', val)
  },
})

// * Form Item Reference
let formFieldRef = ref(null)

defineExpose({
  formFieldRef,
})

let customFieldsAllowedExtensions = ref('')

onMounted(() => {
  if (settings.general.customFieldsAllowedExtensions) {
    customFieldsAllowedExtensions.value = Object.keys(
      settings.general.customFieldsAllowedExtensions,
    ).join(', ')
  }
})

function onAddFile(a) {
  emits('update:modelValue', a.raw)
}

function onRemoveFile(a) {
  emits('update:modelValue', a.raw)
}

// * Colors
let amColors = inject('amColors')
let cssVars = computed(() => {
  return {
    '--am-c-ff-file-icon-bgr': useColorTransparency(amColors.value.colorPrimary, 0.1),
  }
})
</script>

<script>
export default {
  name: 'AttachmentFormField',
}
</script>

<style lang="scss">
.amelia-v2-booking {
  #amelia-container {
    .am-ff__item-files {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      margin-bottom: 18px;
    }

    .am-ff__item-file {
      --am-c-ff-file-bgr: var(--am-c-main-bgr);
      --am-c-ff-file-border: var(--am-c-inp-border);
      --am-c-ff-file-icon: var(--am-c-primary);
      --am-c-ff-file-name: var(--am-c-main-text);

      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
      background-color: var(--am-c-ff-file-bgr);
      border: 1px solid var(--am-c-ff-file-border);
      border-radius: 8px;
      overflow: hidden;

      * {
        font-family: var(--am-font-family);
        box-sizing: border-box;
      }

      &-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--am-c-ff-file-icon-bgr);

        .am-icon-attachment {
          font-size: 28px;
          color: var(--am-c-ff-file-icon);
          line-height: 1;
        }
      }

      &-info {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;

        &-name {
          color: var(--am-c-ff-file-name);
          font-size: 15px;
          font-weight: 500;
          line-height: 24px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &-download {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        text-decoration: none;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 50%;

        &:hover {
          background-color: var(--am-c-ff-file-icon-bgr);
        }

        .am-icon-download {
          font-size: 28px;
          color: var(--am-c-ff-file-icon);
          line-height: 1;
        }
      }
    }
  }
}
</style>
