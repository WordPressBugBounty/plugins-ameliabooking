<template>
  <div
    ref="pageContainer"
    class="am-caep"
    :style="cssVars"
    role="region"
    :aria-busy="loading ? 'true' : 'false'"
    :aria-label="currentRegionLabel"
  >
    <div v-if="ready" v-show="!loading" class="am-caep__inner" :class="responsiveClass">
      <AmAlert
        v-if="alertVisibility"
        :type="messageType"
        :show-border="true"
        :close-after="5000"
        custom-class="am-capi__alert"
        :role="alertA11yRole"
        :aria-live="alertAriaLive"
        @close="closeAlert"
        @trigger-close="closeAlert"
      >
        <template #title>
          <span class="am-icon-checkmark-circle-full" aria-hidden="true"></span> {{ message }}
        </template>
      </AmAlert>

      <AmTabs
        v-model="activeTab"
        class="am-caep__tabs"
        :aria-label="tabsAriaLabel"
        @tab-click="tabClick"
      >
        <AmTabsItem class="am-caep__tabs-item" :label="amLabels.details" name="details">
          <div class="am-caep__sr-only">{{ amLabels.details }}</div>
          <Details ref="detailsRef" :responsive-class="responsiveClass" />
        </AmTabsItem>

        <AmTabsItem
          v-if="amSettings.roles.allowConfigureServices"
          class="am-caep__tabs-item"
          :label="amLabels.heading_services"
          name="services"
        >
          <div class="am-caep__sr-only">{{ amLabels.heading_services }}</div>
          <Services :responsive-class="responsiveClass" />
        </AmTabsItem>

        <AmTabsItem
          v-if="amSettings.roles.allowConfigureSchedule"
          class="am-caep__tabs-item"
          :label="amLabels.working_hours"
          name="workingHours"
        >
          <div class="am-caep__sr-only">{{ amLabels.working_hours }}</div>
          <WeekDays :responsive-class="responsiveClass" />
        </AmTabsItem>

        <AmTabsItem
          v-if="amSettings.roles.allowConfigureSpecialDays"
          class="am-caep__tabs-item"
          :label="amLabels.special_days"
          name="specialDays"
        >
          <div class="am-caep__sr-only">{{ amLabels.special_days }}</div>
          <SpecialDays ref="specialDaysRef" :responsive-class="responsiveClass" />
        </AmTabsItem>

        <AmTabsItem
          v-if="amSettings.roles.allowConfigureDaysOff"
          class="am-caep__tabs-item"
          :label="amLabels.days_off"
          name="daysOff"
        >
          <div class="am-caep__sr-only">{{ amLabels.days_off }}</div>
          <DaysOff ref="daysOffRef" :responsive-class="responsiveClass" />
        </AmTabsItem>

        <AmTabsItem
          v-if="changePasswordEnabled"
          class="am-caep__tabs-item"
          :label="amLabels.password"
          name="password"
        >
          <div class="am-caep__sr-only">{{ amLabels.password }}</div>
          <ChangePassword v-if="!loading" ref="changePassRef" />
          <ProfileSkeleton v-else :item-direction="'column'" :count="2"></ProfileSkeleton>
        </AmTabsItem>

        <AmTabsItem
          v-if="
            amSettings.zoom.enabled ||
            amSettings.googleCalendar.enabled ||
            amSettings.outlookCalendar.enabled ||
            amSettings.appleCalendar.enabled ||
            (amSettings.payments.stripe.enabled && amSettings.payments.stripe.connect.enabled)
          "
          class="am-caep__tabs-item"
          :label="amLabels.integrations_settings"
          name="integrations"
        >
          <div class="am-caep__sr-only">{{ amLabels.integrations_settings }}</div>
          <EmployeeIntegrations :responsive-class="responsiveClass" />
        </AmTabsItem>
      </AmTabs>

      <!-- Profile Footer -->
      <ProfileFooter
        :tab-active="activeTab"
        :password-active="changePasswordEnabled"
        @change-password="changePassword"
        @save-password="savePassword"
        @save-changes="saveEmployee"
      />
      <!-- /Profile Footer -->
    </div>
    <Skeleton v-if="!ready || loading"></Skeleton>
  </div>
</template>

<script setup>
import AmTabs from '../../../../_components/tabs/AmTabs.vue'
import AmTabsItem from '../../../../_components/tabs/AmTabsItem.vue'
// * Import from Vue
import { ref, inject, computed, provide, unref } from 'vue'

import { useElementSize } from '@vueuse/core'

// * Import from Vuex
import { useStore } from 'vuex'

// * Import for axios
import httpClient from '../../../../../plugins/axios'

// * Composables
import { useBackendEmployee } from '../../../../../assets/js/common/employee'
import { useResponsiveClass } from '../../../../../assets/js/common/responsive'
import { useColorTransparency } from '../../../../../assets/js/common/colorManipulation'

// * Dedicated components
import Skeleton from '../Authentication/parts/Skeleton.vue'
import Details from './parts/Details.vue'
import Services from './parts/Services.vue'
import WeekDays from './parts/WeekDays.vue'
import SpecialDays from './parts/SpecialDays.vue'
import DaysOff from './parts/DaysOff.vue'
import ProfileFooter from './parts/ProfileFooter.vue'
import ChangePassword from './parts/ChangePassword.vue'
import AmAlert from '../../../../_components/alert/AmAlert.vue'
import ProfileSkeleton from './parts/ProfileSkeleton.vue'
import EmployeeIntegrations from './parts/Integrations/EmployeeIntegrations.vue'

// * Store
let store = useStore()

// * Settings
const amSettings = inject('settings')

// * Labels
let amLabels = inject('amLabels')

// * Page Content width
let pageContainer = ref(null)
const { width: pageWidth } = useElementSize(pageContainer)

let responsiveClass = computed(() => {
  return useResponsiveClass(pageWidth.value)
})

provide('pageWidth', pageWidth)

let ready = computed(() => store.getters['entities/getReady'])

/********
 * Tabs *
 ********/
const activeTab = ref('details')

function integrationsTabVisible(settings) {
  return (
    settings.zoom?.enabled ||
    settings.googleCalendar?.enabled ||
    settings.outlookCalendar?.enabled ||
    settings.appleCalendar?.enabled ||
    (settings.payments?.stripe?.enabled && settings.payments?.stripe?.connect?.enabled)
  )
}

let currentRegionLabel = computed(() => {
  const L = unref(amLabels)
  switch (activeTab.value) {
    case 'services':
      return L.heading_services
    case 'workingHours':
      return L.working_hours
    case 'specialDays':
      return L.special_days
    case 'daysOff':
      return L.days_off
    case 'password':
      return L.password
    case 'integrations':
      return L.integrations_settings
    case 'details':
    default:
      return L.details
  }
})

let tabsAriaLabel = computed(() => {
  const L = unref(amLabels)
  const S = unref(amSettings)
  const parts = [L.details]
  if (S.roles?.allowConfigureServices) {
    parts.push(L.heading_services)
  }
  if (S.roles?.allowConfigureSchedule) {
    parts.push(L.working_hours)
  }
  if (S.roles?.allowConfigureSpecialDays) {
    parts.push(L.special_days)
  }
  if (S.roles?.allowConfigureDaysOff) {
    parts.push(L.days_off)
  }
  if (changePasswordEnabled.value) {
    parts.push(L.password)
  }
  if (integrationsTabVisible(S)) {
    parts.push(L.integrations_settings)
  }
  return parts.join(' / ')
})

let alertA11yRole = computed(() => {
  return messageType.value === 'error' ? 'alert' : 'status'
})

let alertAriaLive = computed(() => {
  return messageType.value === 'error' ? 'assertive' : 'polite'
})

// * Success message
let message = ref('')

let messageType = ref('success')

// * Change Password Alert visibility
let alertVisibility = ref(false)

function tabClick() {
  alertVisibility.value = false
}

function closeAlert() {
  alertVisibility.value = false
  message.value = ''
}

/***********
 * Details *
 ***********/
let detailsRef = ref(null)
let daysOffRef = ref(null)
let specialDaysRef = ref(null)

let employee = computed(() => {
  return store.getters['employee/getEmployee']
})

let loading = ref(false)

let timeZone = inject('timeZone')

function saveEmployee() {
  Promise.all([
    detailsRef.value?.employeeFormRef
      ? detailsRef.value.employeeFormRef
          .validate()
          .then(() => true)
          .catch(() => false)
      : Promise.resolve(true),
    daysOffRef.value ? daysOffRef.value.validate() : Promise.resolve(true),
    specialDaysRef.value ? specialDaysRef.value.validate() : Promise.resolve(true),
  ]).then(([detailsValid, daysOffValid, specialDaysValid]) => {
    if (!detailsValid) {
      activeTab.value = 'details'
      return
    }

    if (!daysOffValid) {
      activeTab.value = 'daysOff'
      return
    }

    if (!specialDaysValid) {
      activeTab.value = 'specialDays'
      return
    }

    loading.value = true

    httpClient
      .post('/users/providers/' + employee.value.id, useBackendEmployee(store, timeZone.value), {
        params: { source: 'cabinet-provider' },
      })
      .then((response) => {
        store.commit(
          'employee/setSavedSpecialDayList',
          JSON.parse(JSON.stringify(response.data.data.user.specialDayList)),
        )
        store.commit(
          'employee/setSavedDayOffList',
          JSON.parse(JSON.stringify(response.data.data.user.dayOffList)),
        )

        if (daysOffRef.value) daysOffRef.value.commitEditedState()
        if (specialDaysRef.value) specialDaysRef.value.commitEditedState()

        message.value = amLabels.profile_data_success
        messageType.value = 'success'
      })
      .catch((error) => {
        message.value = error.response.data.message
        messageType.value = 'error'
      })
      .finally(() => {
        alertVisibility.value = true
        loading.value = false
      })
  })
}

/***********
 * Password *
 ***********/
let changePassRef = ref(null)
let changePasswordEnabled = ref(false)

function changePassword() {
  changePasswordEnabled.value = true
  activeTab.value = 'password'
}

function savePassword() {
  changePassRef.value.passFormRef.validate((valid) => {
    if (valid) {
      let user = store.getters['auth/getProfile']

      loading.value = true

      httpClient
        .post('/users/providers/' + user.id, { password: store.getters['auth/getNewPassword'] })
        .then(() => {
          message.value = amLabels.password_success
          messageType.value = 'success'
          alertVisibility.value = true

          changePasswordEnabled.value = false

          activeTab.value = 'details'

          store.commit('auth/setNewPassword', '')
          store.commit('auth/setConfirmPassword', '')
        })
        .catch(() => {
          alertVisibility.value = true
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

// * Colors
let amColors = inject('amColors')

let cssVars = computed(() => {
  return {
    '--am-c-caep-primary': amColors.value.colorPrimary,
    '--am-c-caep-text': amColors.value.colorMainText,
    '--am-c-caep-text-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
  }
})
</script>

<script>
export default {
  name: 'CabinetEmployeeProfile',
}
</script>

<style lang="scss">
@mixin am-cabinet-profile {
  // am    - amelia
  // caep - cabinet employee profile
  .am-caep {
    .el-skeleton {
      padding: 32px;
    }

    &__sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    &__tabs {
      .el-tabs__item:focus-visible {
        box-shadow: 0 0 2px 2px var(--am-c-caep-primary) inset;
        border-radius: 3px;
      }
    }

    &__inner {
      display: block;
      padding: 16px 32px;

      .el-skeleton {
        padding-right: 32px;
      }

      &.am-rw- {
        &480 {
          padding: 16px;
        }
      }
    }
  }
}

.amelia-v2-booking #amelia-container {
  @include am-cabinet-profile;
}
</style>
