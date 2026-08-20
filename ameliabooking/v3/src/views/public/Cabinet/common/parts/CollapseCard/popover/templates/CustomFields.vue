<template>
  <div class="am-cc__cf" :class="responsiveClass">
    <template v-for="(item, index) in props.data" :key="index">
      <div class="am-cc__cf-item">
        <span class="am-cc__cf-name" v-html="item.label"></span>
        <div v-if="'value' in item" class="am-cc__cf-value">
          <template v-if="item.type === 'file' && Array.isArray(item.value) && item.value.length">
            <a
              v-for="(file, fileIndex) in item.value"
              :key="fileIndex"
              class="am-cc__cf-value__link"
              :href="getFileDownloadUrl(item, fileIndex)"
              target="_blank"
            >
              {{ file.name }}
            </a>
          </template>
          <span v-else class="am-cc__cf-value__inner">
            {{ customFieldValueDisplay(item.value) }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
// * Import from Vue
import { computed, inject } from 'vue'

// * Import from Vuex
import { useStore } from 'vuex'

// * Composables
import { useResponsiveClass } from '../../../../../../../../assets/js/common/responsive.js'

let props = defineProps({
  data: {
    type: [Array, Object, String],
  },
})

const store = useStore()

let cWidth = inject('containerWidth')

let responsiveClass = computed(() => {
  return useResponsiveClass(cWidth.value)
})

let ajaxUrl = computed(() => store.getters['getBaseUrls'].wpAmeliaPluginAjaxURL)

function getEntityId(item) {
  const customField = store.getters['entities/getCustomField'](item.id)

  if (customField?.saveType === 'customer' && item.customerId) {
    return item.customerId
  }

  return item.entityId
}

function getFileDownloadUrl(item, fileIndex) {
  return (
    ajaxUrl.value +
    '/fields/' +
    item.id +
    '/' +
    getEntityId(item) +
    '/' +
    fileIndex +
    '&source=' +
    item.source
  )
}

function customFieldValueDisplay(value) {
  if (!value) return '/'

  if (Array.isArray(value)) {
    if (value.length === 0) return '/'

    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return item.name || '/'
        }
        return item || '/'
      })
      .join(', ')
  }

  return value
}
</script>

<script>
export default {
  name: 'TemplateCustomFields',
}
</script>

<style lang="scss">
@mixin popover-template-cf {
  .am-cc__cf {
    width: 340px;

    &.am-w-420 {
      width: 100%;
    }

    &-item {
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin: 0 0 16px;

      &:last-child {
        margin: 0;
      }
    }

    &-name {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      word-break: break-word;
      white-space: break-spaces;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.6;
      color: var(--am-c-cc-text-op90);
      margin: 0 0 4px;
    }

    &-value {
      width: 100%;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.6;
      color: var(--am-c-cc-text);
      margin: 0;

      &__inner {
        word-break: break-word;
        white-space: break-spaces;
      }

      &__link {
        color: var(--am-c-cc-primary);
        text-decoration: none;
        word-break: break-word;
        white-space: break-spaces;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.el-popover {
  @include popover-template-cf;
}
</style>
