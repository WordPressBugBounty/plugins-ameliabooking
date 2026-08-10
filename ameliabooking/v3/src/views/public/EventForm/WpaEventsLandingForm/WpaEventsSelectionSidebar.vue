<template>
  <div
    class="amelia-v2-booking wpa-events__tickets-am-shell wpa-events__tickets-root"
    :style="eventCssVars"
  >
    <div class="wpa-events__tickets-head">
      <h2 class="wpa-events__tickets-title">{{ title }}</h2>
      <p v-if="subtitle" class="wpa-events__tickets-sub">{{ subtitle }}</p>
    </div>

    <div class="wpa-events__tickets-scroll">
      <div class="wpa-events__tickets-list">
        <details v-for="item in items" :key="item.id" class="wpa-events__ticket-card" open>
          <summary
            class="wpa-events__ticket-summary"
            :class="{ 'wpa-events__ticket-summary--end': !item.name }"
          >
            <span v-if="item.name" class="wpa-events__ticket-cat">{{ item.name }}</span>
            <span class="wpa-events__ticket-summary-right">
              <span
                :class="[
                  'wpa-events__ticket-left',
                  { 'wpa-events__muted': Number(item.left) === 0 },
                ]"
              >
                <strong>{{ item.left }}</strong>
                <span>{{ item.leftLabel }}</span>
              </span>

              <AmButton
                v-if="item.name"
                type="text"
                category="secondary"
                size="micro"
                :icon-only="true"
                icon="arrow-down"
                :disabled="true"
                custom-class="wpa-events__ticket-chevron-btn"
              />
            </span>
          </summary>
          <div class="wpa-events__ticket-body">
            <div class="wpa-events__ticket-row">
              <span v-if="item.priceFormatted" class="wpa-events__ticket-price">{{
                item.priceFormatted
              }}</span>
              <div class="wpa-events__qty">
                <AmInputNumber
                  :model-value="item.quantity"
                  :min="item.min"
                  :max="item.max"
                  :step="1"
                  :step-strictly="true"
                  size="small"
                  :disabled="item.disabled"
                  :aria-label="item.ariaLabel"
                  @update:model-value="(val) => emit('qty-update', item, val)"
                />
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import AmButton from '@/views/_components/button/AmButton.vue'
import AmInputNumber from '@/views/_components/input-number/AmInputNumber.vue'

defineProps({
  eventCssVars: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['qty-update'])
</script>

<style lang="scss" scoped>
/* Amelia event form tokens (--am-*) come from parent :style (eventFormCssVars); root must not live under #amelia-container when teleported. */

.wpa-events__tickets-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  font-family: var(--am-font-family);
  color: var(--am-c-main-text);
}

.wpa-events__tickets-head {
  width: 100%;
}

.wpa-events__tickets-title {
  margin: 0 0 4px;
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  color: var(--am-c-main-heading-text);
}

.wpa-events__tickets-sub {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--am-c-inp-placeholder);
}

.wpa-events__tickets-scroll {
  flex: 1 1 auto;
  min-height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wpa-events__tickets-list {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wpa-events__ticket-card {
  border: 1px solid var(--am-c-card-border);
  border-radius: 12px;
  background: var(--am-c-card-bgr);
  overflow: hidden;
}

.wpa-events__ticket-summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  line-height: 24px;
  color: var(--am-c-main-heading-text);

  &--end {
    justify-content: flex-end;
    font-weight: 400;
  }
}

.wpa-events__ticket-cat {
  word-break: break-word;
}

.wpa-events__ticket-summary::-webkit-details-marker {
  display: none;
}

.wpa-events__ticket-summary-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.wpa-events__ticket-left {
  font-size: 15px;
  line-height: 24px;
  color: var(--am-c-main-text);
  font-weight: 400;
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  &.wpa-events__muted {
    color: var(--am-c-inp-placeholder);
  }

  strong {
    font-weight: 700;
  }
}

.wpa-events__ticket-chevron-btn {
  pointer-events: none;
  --am-c-btn-first: var(--am-c-inp-placeholder);
  --am-c-btn-first-op20: transparent;
  --am-c-btn-first-op30: transparent;
  --am-c-btn-second: var(--am-c-inp-placeholder);

  :deep(.am-icon) {
    display: inline-flex;
    transform: rotate(0deg);
    transition: transform 0.2s ease;
  }
}

.wpa-events__ticket-card[open] .wpa-events__ticket-chevron-btn :deep(.am-icon) {
  transform: rotate(180deg);
}

.wpa-events__ticket-body {
  border-top: 1px solid var(--am-c-card-border);
  padding: 8px 12px 16px;
}

.wpa-events__ticket-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.wpa-events__ticket-price {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  text-align: right;
  color: var(--am-c-primary);
}

.wpa-events__qty {
  flex: 0 0 auto;
  min-width: 112px;
  max-width: 140px;

  :deep(.am-input-number),
  :deep(.el-input-number) {
    width: 100%;
  }
}

@media (max-width: 899px) {
  .wpa-events__tickets-scroll {
    max-height: none;
  }
}
</style>
