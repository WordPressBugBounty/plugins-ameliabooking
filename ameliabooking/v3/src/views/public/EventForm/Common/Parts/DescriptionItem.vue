<template>
  <div
    v-if="useDescriptionVisibility(props.description)"
    class="am-eli__description"
    :aria-labelledby="props.title ? titleId : undefined"
  >
    <p
      v-if="props.title"
      :id="titleId"
      class="am-eli__description-title"
    >
      {{ props.title }}
    </p>
    <p
      v-if="showMore && props.description.replace(/<[^>]*>?/gm, '').length > props.limit"
      :id="descriptionId"
      class="am-eli__description-text ql-description"
      v-html="props.description.slice(0, props.limit) + '...'"
    >
    </p>
    <p
      v-else
      :id="descriptionId"
      class="am-eli__description-text ql-description"
      v-html="props.description"
    >
    </p>
    <button
      v-if="props.description.replace(/<[^>]*>?/gm, '').length > props.limit"
      type="button"
      class="am-eli__description-btn"
      :aria-expanded="!showMore"
      :aria-controls="descriptionId"
      @click="showMore = !showMore"
    >
      {{ showMore ? displayLabels('show_more') : displayLabels('show_less') }}
    </button>
  </div>
</template>

<script setup>
// * Import from Vue
import {
  ref,
  inject,
  computed,
  onMounted
} from "vue";

// * Composables
import { useDescriptionVisibility } from "../../../../../assets/js/common/helper";

// * Component props
let props = defineProps({
  customizedLabels: {
    type: Object,
    default: () => {
      return {}
    }
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 100
  },
  initState: {
    type: Boolean,
    default: true
  }
})

let showMore = ref(false)

let amLabels = inject('labels')

// * Unique IDs for ARIA linkage
const uid = Math.random().toString(36).slice(2, 8)
const titleId = computed(() => `am-eli-title-${uid}`)
const descriptionId = computed(() => `am-eli-desc-${uid}`)

function displayLabels (label) {
  return Object.keys(props.customizedLabels).length && props.customizedLabels[label] ? props.customizedLabels[label] : amLabels[label]
}

onMounted(() => {
  showMore.value = props.initState
})
</script>

<script>
export default {
  name: "TextItem"
}
</script>

<style lang="scss">
@import '../../../../../assets/scss/common/quill/_quill-mixin.scss';

@mixin event-description {
  .am-eli {
    &__description {

      &-title {
        font-size: 14px;
        font-weight: 500;
        line-height: 1.42857;
        color: var(--am-c-eli-text-op70);
        margin: 0 0 8px;
      }

      &-text {
        font-size: 15px;
        font-weight: 400;
        line-height: 1.6;
        color: var(--am-c-eli-text-op80);
        margin: 0;

        &.ql-description {
          @include quill-styles;
        }
      }

      &-btn {
        display: inline-block;
        font-size: 15px;
        font-weight: 400;
        line-height: 1.6;
        color: var(--am-c-primary);
        cursor: pointer;

        // Reset native button styles
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
        text-align: left;

        &:focus-visible {
          outline: 2px solid var(--am-c-primary);
          outline-offset: 2px;
          border-radius: 2px;
        }
      }
    }
  }
}

// Public
.amelia-v2-booking #amelia-container {
  @include event-description;
}

// Admin
#amelia-app-backend-new {
  @include event-description;
}
</style>
