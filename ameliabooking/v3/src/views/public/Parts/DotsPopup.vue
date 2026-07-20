<template>
  <el-popover
    :visible="editPopVisible"
    :persistent="false"
    :show-arrow="false"
    :width="'auto'"
    :popper-class="'am-cc__popper'"
    :popper-style="cssVars"
    trigger="click"
  >
    <template #reference>
      <AmButton
        ref="menuTriggerRef"
        class="am-cc__edit-btn"
        :class="props.referenceClass"
        category="secondary"
        type="text"
        size="mini"
        icon="dots-vertical"
        :icon-only="true"
        :aria-label="triggerAriaLabel"
        aria-haspopup="menu"
        :aria-expanded="editPopVisible ? 'true' : 'false'"
        @click="toggleMenu"
        @keydown="onMenuTriggerKeydown"
      />
    </template>
    <div
      ref="menuRef"
      v-click-outside="close"
      class="am-cc__edit"
      role="menu"
      @keydown="onMenuKeydown"
    >
      <!-- Edit -->
      <AmButton
        v-if="props.haveEdit"
        class="am-cc__edit-item"
        category="secondary"
        type="text"
        prefix="edit"
        role="menuitem"
        :aria-label="amLabels.edit"
        @click="editItem"
      >
        <span class="am-cc__edit-text">
          {{ amLabels.edit }}
        </span>
      </AmButton>
      <!-- /Edit -->

      <!-- View -->
      <AmButton
        v-if="props.haveView"
        class="am-cc__edit-item"
        category="secondary"
        type="text"
        prefix="search"
        role="menuitem"
        :aria-label="amLabels.view"
        @click="editItem"
      >
        <span class="am-cc__edit-text">
          {{ amLabels.view }}
        </span>
      </AmButton>
      <!-- /View -->

      <!-- Delete -->
      <AmButton
        v-if="props.haveDelete"
        class="am-cc__edit-item am-delete"
        category="secondary"
        type="text"
        prefix="clearable"
        role="menuitem"
        :aria-label="amLabels.delete"
        @click="removeItem"
      >
        <span class="am-cc__edit-text">
          {{ amLabels.delete }}
        </span>
      </AmButton>
      <!-- /Delete -->

      <!-- Duplicate -->
      <AmButton
        v-if="props.haveDuplicate"
        class="am-cc__edit-item am-clone"
        category="secondary"
        type="text"
        prefix="clearable"
        role="menuitem"
        :aria-label="amLabels.duplicate"
        @click="duplicateItem"
      >
        <span class="am-cc__edit-text">
          {{ amLabels.duplicate }}
        </span>
      </AmButton>
      <!-- /Duplicate -->
    </div>
  </el-popover>
</template>

<script setup>
// * Import from Vue
import { ref, inject, computed, unref, nextTick } from 'vue'

// * Dedicated components
import { ClickOutside as vClickOutside } from 'element-plus'
import { useColorTransparency } from '../../../assets/js/common/colorManipulation'
import AmButton from '../../_components/button/AmButton.vue'

// * Component properties
let props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  referenceClass: {
    type: String,
    default: '',
  },
  haveDuplicate: {
    type: Boolean,
    default: false,
  },
  haveDelete: {
    type: Boolean,
    default: true,
  },
  haveEdit: {
    type: Boolean,
    default: true,
  },
  haveView: {
    type: Boolean,
    default: false,
  },
  triggerAriaLabel: {
    type: String,
    default: '',
  },
})

// * Components emits
let emits = defineEmits(['remove', 'edit', 'duplicate'])

// * Labels
let amLabels = inject('amLabels')

let menuTriggerRef = ref(null)
let menuRef = ref(null)
let editPopVisible = ref(false)

const triggerAriaLabel = computed(() => {
  const L = unref(amLabels)
  return props.triggerAriaLabel || L?.actions || L?.edit || ''
})

function toggleMenu(e) {
  e.stopPropagation()
  editPopVisible.value = !editPopVisible.value
}

function onMenuTriggerKeydown(e) {
  const openKeys = ['Enter', ' ', 'Spacebar', 'ArrowDown']

  if (openKeys.includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    editPopVisible.value = true
    focusFirstMenuItem()
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    close(true)
  }
}

function getVisibleMenuItems(container = null) {
  const menuRoot = container || menuRef.value

  if (!menuRoot) {
    return []
  }

  return Array.from(menuRoot.querySelectorAll('.am-cc__edit-item')).filter(
    (item) => !item.disabled && item.offsetParent !== null,
  )
}

function focusFirstMenuItem() {
  nextTick(() => {
    const firstItem = getVisibleMenuItems(menuRef.value)[0]

    if (firstItem) {
      firstItem.focus()
    }
  })
}

function focusMenuTrigger() {
  nextTick(() => {
    const trigger = menuTriggerRef.value?.$el || menuTriggerRef.value

    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus()
    }
  })
}

function onMenuKeydown(e) {
  const menuItems = getVisibleMenuItems(e.currentTarget)

  if (!menuItems.length) {
    return
  }

  const currentIndex = menuItems.indexOf(document.activeElement)

  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    close(true)
    return
  }

  if (e.key === 'Tab') {
    close()
    return
  }

  if (e.key === 'Home') {
    e.preventDefault()
    menuItems[0].focus()
    return
  }

  if (e.key === 'End') {
    e.preventDefault()
    menuItems[menuItems.length - 1].focus()
    return
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()

    const step = e.key === 'ArrowDown' ? 1 : -1
    const fallbackIndex = e.key === 'ArrowDown' ? 0 : menuItems.length - 1
    const nextIndex =
      currentIndex === -1
        ? fallbackIndex
        : (currentIndex + step + menuItems.length) % menuItems.length

    menuItems[nextIndex].focus()
  }
}

function editItem() {
  emits('edit', props.index)

  close()
}

function removeItem() {
  emits('remove', props.index)

  close()
}

function duplicateItem() {
  emits('duplicate', props.index)

  close()
}

function close(focusTrigger = false) {
  editPopVisible.value = false

  if (focusTrigger) {
    focusMenuTrigger()
  }
}

/*************
 * Customize *
 *************/
// * Fonts
let amFonts = inject('amFonts')

// * Colors block
let amColors = inject('amColors')

let cssVars = computed(() => {
  return {
    '--am-c-cc-error': amColors.value.colorError,
    '--am-c-cc-error-op15': useColorTransparency(amColors.value.colorError, 0.15),
    '--am-c-cc-bgr': amColors.value.colorMainBgr,
    '--am-c-cc-text': amColors.value.colorMainText,
    '--am-c-cc-text-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
    '--am-c-cc-text-op15': useColorTransparency(amColors.value.colorMainText, 0.15),
    '--am-c-cc-primary': amColors.value.colorPrimary,
    '--am-font-family': amFonts.value.fontFamily,
  }
})
</script>

<script>
export default {
  name: 'DotsPopup',
}
</script>

<style lang="scss">
@mixin am-dots-popup {
  .am-cc {
    &__edit-btn {
      cursor: pointer;

      &.am-button:focus-visible {
        outline: 2px solid var(--am-c-cc-primary);
        outline-offset: 2px;
      }
    }
  }
}

@mixin dots-popup-popper {
  .am-cc {
    &__edit {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &-item {
        background: transparent;
        color: var(--am-c-cc-text);
        padding: 4px;
        justify-content: flex-start;

        &:hover {
          background-color: var(--am-c-cc-text-op15);
        }

        &.am-delete {
          --am-c-cc-text: var(--am-c-cc-error);

          &:hover {
            background-color: var(--am-c-cc-error-op15);
          }
        }

        span[class^='am-icon'] {
          font-size: 24px;
          color: inherit;
          margin: 0 4px 0 0;
        }

        &.am-button {
          width: 100%;
          border: none;
        }
      }

      &-text {
        font-size: 14px;
        line-height: 1.7142857;
        color: inherit;
      }
    }
  }

  &.am-cc__popper {
    padding: 6px 4px;
    background-color: var(--am-c-cc-bgr);
    border-color: var(--am-c-cc-bgr);
    box-shadow: 0 2px 12px 0 var(--am-c-cc-text-op10);

    * {
      font-family: var(--am-font-family), sans-serif;
      box-sizing: border-box;
    }
  }
}

.amelia-v2-booking #amelia-container {
  @include am-dots-popup;
}

.el-popper.el-popover {
  @include dots-popup-popper;
}
</style>
