<template>
  <div class="amelia-v2-booking wpa-events__book-button" :style="eventCssVars">
    <div id="amelia-container" class="wpa-events__book-button-inner">
      <AmButton
        :type="buttonType"
        :category="buttonCategory"
        size="small"
        class="wpa-events__book-button-btn"
        :disabled="bookDisabled"
        @click="onPrimaryClick"
      >
        {{ bookLabel }}
      </AmButton>
    </div>
  </div>
</template>

<script setup>
import AmButton from '@/views/_components/button/AmButton.vue'

defineProps({
  eventCssVars: {
    type: Object,
    default: () => ({}),
  },
  eventId: {
    type: Number,
    default: 0,
  },
  bookLabel: {
    type: String,
    default: '',
  },
  bookDisabled: {
    type: Boolean,
    default: false,
  },
  buttonType: {
    type: String,
    default: 'filled',
  },
  buttonCategory: {
    type: String,
    default: 'primary',
  },
})

const emit = defineEmits(['book'])

function onPrimaryClick() {
  emit('book')
}
</script>

<style lang="scss" scoped>
.wpa-events__book-button {
  padding: 16px 24px;
  background: var(--am-c-main-bgr);
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  font-family: var(--am-font-family);
  color: var(--am-c-main-text);

  &-inner {
    width: 100%;
    max-width: var(--wpa-max, 1048px);
    display: flex;
    justify-content: flex-end;
    align-items: center;

    @media (max-width: 899px) {
      justify-content: stretch;

      .wpa-events__book-button-btn,
      .wpa-events__book-button-link {
        flex: 1 1 auto;
        width: 100%;
      }
    }
  }

  &-link {
    text-decoration: none;
    box-sizing: border-box;
  }
}
</style>
