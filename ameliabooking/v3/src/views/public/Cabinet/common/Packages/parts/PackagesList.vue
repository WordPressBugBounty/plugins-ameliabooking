<template>
  <template v-if="props.packages.length">
    <div
      class="am-sc__list"
      role="list"
      :aria-label="amLabels.packages || 'Packages list'"
    >
      <div
        v-for="(pack, index) in props.packages"
        :key="pack[0]"
        :style="cssVars"
        class="am-sc"
        :class="{'am-sc__canceled': pack[1].packageData.status === 'canceled'}"
        role="listitem"
        :aria-labelledby="getPackageTitleId(pack[0])"
        :aria-describedby="getPackageDescriptionIds(pack[0], pack[1])"
      >
        <div
          class="am-sc__top"
          :class="responsiveClass"
        >
          <div class="am-sc__top-menu">
            <div class="am-sc__top-left">
              <div :id="getPackageTitleId(pack[0])" class="am-sc__name">
                {{ pack[1].packageData.name }}
              </div>
              <div
                v-if="pack[1].packageData.end"
                :id="getPackageDateId(pack[0])"
                class="am-sc__date"
              >
                {{ amLabels.package_book_expire }} {{ getFrontedFormattedDate(pack[1].packageData.end.split(' ')[0]) }}
              </div>
              <div v-else :id="getPackageDateId(pack[0])" class="am-sc__date">
                {{ `${amLabels.package_book_expiration} ${amLabels.package_book_unlimited}` }}
              </div>
            </div>
            <el-popover
              v-if="!licence.isStarter && amSettings.featuresIntegrations.invoices.enabled"
              ref="editRef"
              :visible="editPopVisible[index]"
              :persistent="false"
              :show-arrow="false"
              :width="'auto'"
              :popper-class="'am-sc__popper'"
              :popper-style="cssVars"
              trigger="click"
              placement="bottom-end"
            >
              <template #reference>
                <AmButton
                  :ref="(el) => setEditTriggerRef(el, index)"
                  class="am-cc__edit-btn"
                  category="secondary"
                  type="text"
                  size="mini"
                  icon="dots-vertical"
                  :icon-only="true"
                  :aria-label="getActionsButtonLabel(pack[1])"
                  :aria-expanded="editPopVisible[index] ? 'true' : 'false'"
                  :aria-controls="getInvoiceMenuId(pack[0])"
                  @click="editItem($event, index)"
                />
              </template>
              <div
                :id="getInvoiceMenuId(pack[0])"
                v-click-outside="() => closeEditItemPopup(index)"
                class="am-sc__edit"
                role="group"
                :aria-label="getActionsMenuLabel(pack[1])"
                @keydown="handleMenuArrowNavigation($event, index)"
                @keydown.esc.stop.prevent="closeEditItemPopup(index, true)"
              >
                <!-- Invoice -->
                <AmButton
                  v-if="!licence.isStarter"
                  :ref="(el) => setFirstAndMenuItemRef(el, index, 0)"
                  class="am-sc__edit-item"
                  category="secondary"
                  type="text"
                  prefix="eye"
                  @click="previewInvoice(index)"
                >
                  <span class="am-sc__edit-text">
                    {{ amLabels['preview_invoice'] }}
                  </span>
                </AmButton>

                <AmButton
                  v-if="!licence.isStarter"
                  :ref="(el) => setMenuItemRef(el, index, 1)"
                  class="am-sc__edit-item"
                  category="secondary"
                  type="text"
                  prefix="download"
                  @click="downloadInvoice(index)"
                >
                  <span class="am-sc__edit-text">
                    {{ amLabels['download_invoice'] }}
                  </span>
                </AmButton>
                <!-- /Invoice -->
              </div>
            </el-popover>
          </div>

          <AmButton
            class="am-sc__top-right"
            :class="responsiveClass"
            category="secondary"
            type="plain"
            size="small"
            :aria-labelledby="`${getPackageTitleId(pack[0])} ${getPackageCapacityId(pack[0])}`"
            :aria-describedby="getPackageDescriptionIds(pack[0], pack[1])"
            @click="selectId(pack[0])"
          >
            <span :id="getPackageCapacityId(pack[0])" class="am-sc__capacity">
              {{ packagesSlotsCalculation(pack[1]) }}
            </span>
            <span class="am-sc__btn">
              <span class="am-icon-arrow-right" aria-hidden="true"></span>
            </span>
          </AmButton>
        </div>
        <template v-if="pack[1].packageData.end && pack[1].packageData.status !== 'canceled'">
          <div v-if="expirationDate(pack[1].packageData.end.split(' ')[0]) > 0" class="am-sc__bottom">
            <span
              :id="getPackageExpirationId(pack[0])"
              class="am-sc__expiration"
              :class="{'am-mobile': cWidth < 481}"
            >
              <span class="am-icon-triangle-info" aria-hidden="true"></span> {{ `${amLabels.package_deal_expire_in} ${expirationDate(pack[1].packageData.end.split(' ')[0])} ${amLabels.expires_days}, ${amLabels.appointments_deal_expire}` }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </template>
  <EmptyState
    v-else
    :heading="amLabels.no_pack_found"
    :text="amLabels.have_no_pack"
  ></EmptyState>
</template>

<script setup>
// * Import from libraries
import moment from 'moment'
import { ClickOutside as vClickOutside } from "element-plus";

// * Import from Vue
import {
  reactive,
  computed,
  inject,
  ref,
  onMounted,
  nextTick,
  watch
} from 'vue'

// * Dedicated components
import EmptyState from "../../parts/EmptyState.vue"

// * Composables
import {
  getFrontedFormattedDate
} from '../../../../../../assets/js/common/date'
import {
  useColorTransparency
} from '../../../../../../assets/js/common/colorManipulation'
import httpClient from '../../../../../../plugins/axios'
import { createFileUrlFromResponse } from '../../../../../../assets/js/common/helper'
import { useStore } from 'vuex'
import AmButton from "@/views/_components/button/AmButton.vue";

// * Vars
let store = useStore()

// * Component properties
let props = defineProps({
  packages: {
    type: [Object, Array],
    default: () => {}
  },
  responsiveClass: {
    type: String,
    default: ''
  }
})

// * Components emits
let emits = defineEmits(['click'])

function expirationDate(end) {
  return moment(end, 'YYYY-MM-DD').diff(moment(), 'days')
}

function selectId (id) {
  emits('click', id)
}

function purchasedCount (data, id, type) {
  let count = 0

  Object.keys(data).forEach((serviceId) => {
    if (id === null || parseInt(id) === parseInt(serviceId)) {
      count += data[serviceId].purchaseData[type]
    }
  })

  return count
}

function bookedNumberText (numb) {
  return numb === 1 ? amLabels.value.appointment_booked : amLabels.value.appointments_booked
}

function packagesSlotsCalculation(data) {
  let notBooked = data.packageData.sharedCapacity ? data.packageData.sharedCount : purchasedCount(data.services, null, 'count')
  let slotsCapacity = data.packageData.sharedCapacity ? data.packageData.sharedTotal : purchasedCount(data.services, null, 'total')

  return `${slotsCapacity - notBooked}/${slotsCapacity} ${bookedNumberText(slotsCapacity - notBooked)}`
}

/**
 * * Customize
 * */

let cWidth = inject('containerWidth')

// * Root Settings
const amSettings = inject('settings')

// * Customized form data
let amCustomize = inject('amCustomize')

// * labels
const labels = inject('labels')

// * local language short code
const localLanguage = inject('localLanguage')

// * if local lang is in settings lang
let langDetection = computed(() => amSettings.general.usedLanguages.includes(localLanguage.value))

// * Computed labels
let amLabels = computed(() => {
  let computedLabels = reactive({...labels})

  let customizedLabels = amCustomize.value.packagesList.translations
  if (customizedLabels) {
    Object.keys(customizedLabels).forEach(labelKey => {
      if (customizedLabels[labelKey][localLanguage.value] && langDetection.value) {
        computedLabels[labelKey] = customizedLabels[labelKey][localLanguage.value]
      } else if (customizedLabels[labelKey].default) {
        computedLabels[labelKey] = customizedLabels[labelKey].default
      }
    })
  }
  return computedLabels
})

// * Colors
let amColors = inject('amColors')

// * Plugin Licence
let licence = inject('licence')

const editPopVisible = ref([])
const editTriggerRefs = ref([])
const firstMenuItemRefs = ref([])
const menuItemRefs = ref([])

onMounted(() => {
  syncEditPopVisible()
})

watch(() => props.packages, () => {
  syncEditPopVisible()
}, { deep: true })

function syncEditPopVisible () {
  let packages = Array.isArray(props.packages) ? props.packages : Object.entries(props.packages || {})
  editPopVisible.value = packages.map((_, index) => editPopVisible.value[index] || false)
}

function getPackageBaseId (id) {
  return `am-package-${id}`
}

function getPackageTitleId (id) {
  return `${getPackageBaseId(id)}-title`
}

function getPackageDateId (id) {
  return `${getPackageBaseId(id)}-date`
}

function getPackageCapacityId (id) {
  return `${getPackageBaseId(id)}-capacity`
}

function getPackageExpirationId (id) {
  return `${getPackageBaseId(id)}-expiration`
}

function getInvoiceMenuId (id) {
  return `${getPackageBaseId(id)}-actions`
}

function getPackageDescriptionIds (id, data) {
  let descriptionIds = [getPackageDateId(id)]

  if (data.packageData.end && data.packageData.status !== 'canceled' && expirationDate(data.packageData.end.split(' ')[0]) > 0) {
    descriptionIds.push(getPackageExpirationId(id))
  }

  return descriptionIds.join(' ')
}

function getActionsButtonLabel (data) {
  return `${amLabels.value.more_actions || 'More actions'}: ${data.packageData.name}`
}

function getActionsMenuLabel (data) {
  return `${amLabels.value.more_actions || 'More actions'}: ${data.packageData.name}`
}

function setEditTriggerRef (el, index) {
  if (el) {
    editTriggerRefs.value[index] = el
  }
}

function setFirstMenuItemRef (el, index) {
  if (el) {
    firstMenuItemRefs.value[index] = el
  }
}

function setFirstAndMenuItemRef (el, rowIndex, itemIndex) {
  setFirstMenuItemRef(el, rowIndex)
  setMenuItemRef(el, rowIndex, itemIndex)
}

function setMenuItemRef (el, rowIndex, itemIndex) {
  if (!el) {
    return
  }

  if (!menuItemRefs.value[rowIndex]) {
    menuItemRefs.value[rowIndex] = []
  }

  menuItemRefs.value[rowIndex][itemIndex] = el
}

function resolveFocusableElement (refItem) {
  if (!refItem) {
    return null
  }

  // Native element ref.
  if (typeof refItem.focus === 'function') {
    return refItem
  }

  // Component ref (e.g. AmButton) exposes DOM root on $el.
  let componentRoot = refItem.$el
  if (componentRoot?.tagName?.toLowerCase() === 'button') {
    return componentRoot
  }

  if (componentRoot?.querySelector) {
    return componentRoot.querySelector('button, [tabindex]:not([tabindex="-1"])')
  }

  return null
}

function focusRefWithRetry (refItem, attempts = 4) {
  const focusableElement = resolveFocusableElement(refItem)
  if (focusableElement) {
    focusableElement.focus()
    return
  }

  if (attempts > 1) {
    setTimeout(() => {
      focusRefWithRetry(refItem, attempts - 1)
    }, 16)
  }
}

function focusEditTrigger (index) {
  nextTick(() => {
    focusRefWithRetry(editTriggerRefs.value[index])
  })
}

function getFocusableMenuItems (rowIndex) {
  let itemRefs = menuItemRefs.value[rowIndex] || []
  return itemRefs
    .map(refItem => resolveFocusableElement(refItem))
    .filter(Boolean)
}

function handleMenuArrowNavigation (event, rowIndex) {
  let keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(event.key)) {
    return
  }

  let focusableItems = getFocusableMenuItems(rowIndex)
  if (!focusableItems.length) {
    return
  }

  event.preventDefault()

  let currentIndex = focusableItems.findIndex(item => item === document.activeElement)
  if (event.key === 'Home') {
    focusableItems[0].focus()
    return
  }

  if (event.key === 'End') {
    focusableItems[focusableItems.length - 1].focus()
    return
  }

  if (currentIndex === -1) {
    focusableItems[0].focus()
    return
  }

  let direction = event.key === 'ArrowDown' ? 1 : -1
  let nextIndex = (currentIndex + direction + focusableItems.length) % focusableItems.length
  focusableItems[nextIndex].focus()
}

async function editItem(e, index) {
  e.stopPropagation()
  let showMenu = !editPopVisible.value[index]
  editPopVisible.value = editPopVisible.value.map((val, i) =>
    i === index ? showMenu : false
  )

  if (showMenu) {
    await nextTick()
    focusRefWithRetry(firstMenuItemRefs.value[index])
  }
}

function closeEditItemPopup(index, restoreFocus = false) {
  editPopVisible.value[index] = false

  if (restoreFocus) {
    focusEditTrigger(index)
  }
}

function previewInvoice (index) {
  store.commit('cabinet/setPackageLoading', true)
  httpClient.post(
    '/invoices/' + props.packages[index][1].packageData.payments[0].id,
    { format: 'pdf' },
    {params: {source: 'cabinet-customer'}}
  ).then(response => {
    window.open(createFileUrlFromResponse(response))
    closeEditItemPopup(index, true)
  })
  .catch(e => {
    console.log(e.message)
  }).finally(() => {
    store.commit('cabinet/setPackageLoading', false)
  })
}

function downloadInvoice (index) {
  store.commit('cabinet/setPackageLoading', true)
  const format = amSettings.notifications.invoiceFormat || 'pdf'
  httpClient.post(
    '/invoices/' + props.packages[index][1].packageData.payments[0].id,
    { format },
    {params: {source: 'cabinet-customer'}}
  ).then(response => {
    let url = createFileUrlFromResponse(response, format)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    closeEditItemPopup(index, true)
  })
  .catch(e => {
    console.log(e.message)
  }).finally(() => {
    store.commit('cabinet/setPackageLoading', false)
  })
}

let cssVars = computed(() => {
  return {
    '--am-c-sc-bgr': amColors.value.colorMainBgr,
    '--am-c-sc-bgr-op15': useColorTransparency(amColors.value.colorMainText, 0.15),
    '--am-c-sc-text': amColors.value.colorMainText,
    '--am-c-sc-text-op80': useColorTransparency(amColors.value.colorMainText, 0.8),
    '--am-c-sc-text-op60': useColorTransparency(amColors.value.colorMainText, 0.6),
    '--am-c-sc-text-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
    '--am-c-sc-text-op15': useColorTransparency(amColors.value.colorMainText, 0.15),
    '--am-c-sc-warning-op50': useColorTransparency(amColors.value.colorWarning, 0.5),
  }
})
</script>

<script>
export default {
  name: 'CabinetPackagesList'
}
</script>

<style lang="scss">
@mixin select-card-block {
  // am - amelia
  // sc - select card
  .am-sc {
    display: flex;
    flex-direction: column;
    background-color: var(--am-c-sc-bgr);
    border-radius: 8px;
    border: 1px solid var(--am-c-sc-bgr-op15);
    padding: 16px;
    margin: 0 0 8px;
    box-shadow: 0 4px 13px -11px var(--am-c-sc-text);

    * {
      font-family: var(--am-font-family);
      box-sizing: border-box;
    }

    &__canceled {
      .am-sc__top {
        --am-c-sc-text: var(--am-c-sc-text-op60);
      }
    }

    &__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;

      &.am-rw-500 {
        flex-wrap: wrap;
      }

      &-menu {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;

        .am-cc__edit-btn {
          height: 100%;
        }
      }

      &-right {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 0 0 auto;
        background: transparent;
        font: inherit;
        cursor: pointer;
        margin-top: 12px;
        width: 100%;
        justify-content: center;
        border-radius: 8px;
        border: 1px solid var(--am-c-sc-bgr-op15);
        padding: 4px;

        &:focus-visible {
          outline: 2px solid var(--am-c-sc-text);
          outline-offset: 2px;
        }

        * {
          color: var(--am-c-sc-text);
          font-size: 15px;
        }

        &.am-rw-500 {
          width: 100%;
          margin-top: 12px;
          justify-content: center;
        }
      }
    }

    &__name {
      color: var(--am-c-sc-text);
      font-size: 15px;
      line-height: 1.6;
      font-weight: 500;
      margin-bottom: 2px;
    }

    &__date {
      color: var(--am-c-sc-text-op80);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.42857;
    }

    &__capacity {
      font-weight: 400;
    }

    &__btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__expiration {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.42857;
      color: var(--am-c-sc-text);
      background-color: var(--am-c-sc-warning-op50);
      border-radius: 10px;
      padding: 0 8px;
      margin: 10px 0 0;
      width: 100%;
      justify-content: center;

      &.am-mobile {
        margin: 16px 0 0;
      }

      [class^='am-icon'] {
        display: block;
        font-size: 20px;
        margin-right: 4px;
      }
    }
  }
}

.am-sc {
  &__list {
    display: block;
  }

  &__edit {
    &-item {
      display: flex;
      align-items: center;
      width: 100%;
      color: var(--am-c-sc-text);
      font: inherit;
      text-align: left;
      background: transparent;
      border: 0;
      border-radius: 4px;
      padding: 4px;
      cursor: pointer;
      transition: background-color .3s ease-in-out;

      &:hover,
      &:focus-visible {
        background-color: var(--am-c-sc-text-op15);
      }

      &:focus-visible {
        outline: 2px solid var(--am-c-sc-text);
        outline-offset: 2px;
      }

      span[class^="am-icon"] {
        font-size: 24px;
        color: inherit;
        margin: 0 4px 0 0;
      }
    }

    &-text {
      font-size: 14px;
      line-height: 1.7142857;
      color: inherit;
    }
  }
}

.am-cc__edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  min-width: 32px;
  padding: 4px;
  color: var(--am-c-sc-text);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;

  span[class^="am-icon"] {
    color: inherit;
  }

  &:focus-visible {
    outline: 2px solid var(--am-c-sc-text);
    outline-offset: 2px;
  }
}

.am-sc__popper {
  padding: 6px 4px;
  background-color: var(--am-c-sc-bgr);
  border-color: var(--am-c-sc-bgr);
  box-shadow: 0 2px 12px 0 var(--am-c-sc-text-op10);

  * {
    font-family: var(--am-font-family), sans-serif;
    box-sizing: border-box;
  }

  &.el-popover.el-popper {
    padding: 6px 4px;
  }
}

.amelia-v2-booking #amelia-container {
  @include select-card-block;
}
</style>