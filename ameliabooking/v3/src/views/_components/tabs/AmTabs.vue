<template>
  <el-tabs
    :id="id"
    ref="tabsRef"
    v-model="model"
    :type="type"
    :closable="closable"
    :addable="addable"
    :editable="editable"
    :tab-position="tabPosition"
    :before-leave="beforeLeave"
    :stretch="stretch"
    @tab-click="(...args) => emits('tab-click', ...args)"
    @tab-change="(...args) => emits('tab-change', ...args)"
    @tab-remove="(...args) => emits('tab-remove', ...args)"
    @tab-add="(...args) => emits('tab-add', ...args)"
    @edit="(...args) => emits('edit', ...args)"
  >
    <slot></slot>

    <template v-if="$slots['add-icon']" #add-icon>
      <slot name="add-icon"></slot>
    </template>
  </el-tabs>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, toRefs } from 'vue'

/**
 * Component Props
 */
const props = defineProps({
  id: {
    type: String,
  },
  modelValue: {
    type: [String, Number],
  },
  type: {
    type: String,
    default: '',
    validator: (value) => ['', 'card', 'border-card'].includes(value),
  },
  closable: {
    type: Boolean,
    default: false,
  },
  addable: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  tabPosition: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value),
  },
  beforeLeave: {
    type: Function,
    default: () => true,
  },
  stretch: {
    type: Boolean,
    default: false,
  },
  tabsArray: {
    type: Array,
  },
})

/**
 * Component Emits
 * */
const emits = defineEmits([
  'tab-click',
  'tab-change',
  'tab-remove',
  'tab-add',
  'edit',
  'update:modelValue',
])

const tabsRef = ref(null)

/**
 * Component model
 */
let { modelValue } = toRefs(props)
let model = computed({
  get: () => modelValue.value,
  set: (val) => {
    emits('update:modelValue', val)
  },
})

defineExpose({
  currentName: computed(() => tabsRef.value?.currentName),
})

let tabsObserver = null
let observedTabsElement = null

function getTabsElement() {
  return tabsRef.value && tabsRef.value.$el ? tabsRef.value.$el : tabsRef.value
}

function getDirectTabsChild(tabsElement, className) {
  return Array.from(tabsElement.children).find((child) => child.classList.contains(className))
}

function moveTabsHeaderBeforeContent() {
  const tabsElement = getTabsElement()

  if (!tabsElement) {
    return
  }

  const headerElement = getDirectTabsChild(tabsElement, 'el-tabs__header')
  const contentElement = getDirectTabsChild(tabsElement, 'el-tabs__content')

  if (headerElement && contentElement && contentElement.previousElementSibling !== headerElement) {
    tabsElement.insertBefore(headerElement, contentElement)
  }
}

function observeTabsDom() {
  const tabsElement = getTabsElement()

  if (
    !tabsElement ||
    observedTabsElement === tabsElement ||
    typeof MutationObserver === 'undefined'
  ) {
    return
  }

  if (tabsObserver) {
    tabsObserver.disconnect()
  }

  observedTabsElement = tabsElement
  tabsObserver = new MutationObserver(updateTabsDomOrder)
  tabsObserver.observe(tabsElement, { childList: true })
}

function updateTabsDomOrder() {
  nextTick(() => {
    moveTabsHeaderBeforeContent()
    observeTabsDom()
  })
}

onMounted(updateTabsDomOrder)
onUpdated(updateTabsDomOrder)

onBeforeUnmount(() => {
  if (tabsObserver) {
    tabsObserver.disconnect()
  }
})
</script>

<script>
export default {
  name: 'AmTabs',
}
</script>

<style lang="scss">
@mixin am-tabs {
  .el-tabs {
    display: flex;
    flex-direction: column !important;
    gap: 16px 0;
  }
}
// public
.amelia-v2-booking #amelia-container {
  @include am-tabs;
}

// admin
#amelia-app-backend-new {
  @include am-tabs;
}
</style>
