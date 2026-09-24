<template>
  <div class="am-cc-cft">
    <el-collapse v-model="activeCollapse" class="am-cc-cft__collapse" accordion>
      <el-collapse-item v-for="(item, index) in props.data":key="index" :name="index" class="am-cc-cft__collapse-item">
        <template #title>
          <!-- Customer Name -->
          <div class="am-cc-cft__customer-name" :class="noShowData(item.customer.noShowCount).class">
            <span v-if="noShowData(item.customer.noShowCount).icon"
              :class="`am-icon-${noShowData(item.customer.noShowCount).icon}`" />
            {{ item.customer.firstName + ' ' + item.customer.lastName }}
          </div>
          <!-- /Customer Name -->
        </template>

        <!-- Customer Info -->
        <div v-if="
          (item.customer.email && customerEmailVisibility) ||
          (item.customer.phone && customerPhoneVisibility)
        " class="am-cc-cft__customer-data__wrapper" :class="props.responsiveClass">
          <!-- Customer Email -->
          <div v-if="item.customer.email && customerEmailVisibility" class="am-cc-cft__customer-data"
            :class="props.responsiveClass">
            <span class="am-icon-email"></span>
            <a :href="`mailto:${item.customer.email}`">
              {{ item.customer.email }}
            </a>
          </div>
          <!-- /Customer Email -->

          <!-- Customer Phone -->
          <div v-if="item.customer.phone && customerPhoneVisibility" class="am-cc-cft__customer-data"
            :class="props.responsiveClass">
            <span class="am-icon-phone"></span>
            <a :href="`tel:${item.customer.phone}`">
              {{ item.customer.phone }}
            </a>
          </div>
          <!-- /Customer Phone -->
        </div>
        <!-- /Customer Info -->

        <!-- Custom Fields -->
        <div class="am-cc-cft__fields" :class="props.responsiveClass">
          <template v-for="cf in item.customFields" :key="index + '_' + cf.id">
            <component :is="setTemplate(cf.type)"
              v-model="cf.value"
              v-bind="setProps(cf, index)"
            >
            </component>
          </template>
        </div>
        <!-- /Custom Fields -->
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
// * Import from Vue
import { ref, inject, computed } from 'vue'

// * Import Form Templates
import { formFieldsTemplates } from '@/assets/js/common/formFieldsTemplates'

// * Import from Props
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  responsiveClass: {
    type: String,
    default: '',
  },
  customizedOptions: {
    type: Object,
    default: () => ({}),
  },
})

// * Data in shortcode
const shortcodeData = inject('shortcodeData')

// * Settings
const amSettings = inject('settings')

let activeCollapse = ref(props.data.length > 1 ? null : 0)

const { noShowData } = inject('noShowData', {
  noShowData: () => ({ class: '', icon: '' }),
})

let customerEmailVisibility = computed(() =>
  shortcodeData.value.cabinetType === 'employee'
    ? (props.customizedOptions.customerEmail?.visibility ?? true)
    : true,
)
let customerPhoneVisibility = computed(() =>
  shortcodeData.value.cabinetType === 'employee'
    ? (props.customizedOptions.customerPhone?.visibility ?? true)
    : true,
)

function setTemplate(type) {
  return formFieldsTemplates[type]
}

function setProps(cf, index) {
  let itemProps = {
    id: cf.id,
    itemName: `${index}cf${cf.id}`,
    label: cf.label,
    options: cf.options ?? [],
    class: `am-cc-cft__field am-cf-width-${cf.width}`,
    disabled: true,
  }

  if (cf.type === 'checkbox' || cf.type === 'radio') {
    itemProps.options = itemProps.options.map((option) => {
      return {
        ...option,
        value: option.label,
      }
    })
  }

  if (cf.type === 'text-area') {
    itemProps.itemType = 'textarea'
  }

  if (cf.type === 'file') {
    itemProps.isUpload = false
  }

  if (cf.type === 'datepicker') {
    itemProps.weekStartsFromDay = amSettings.wordpress.startOfWeek
  }

  if (cf.type === 'file') {
    itemProps.bookingId = cf.bookingId
  }

  return itemProps
}
</script>

<style lang="scss">
// * Custom Fields Template
// * cc - collapse card
// * cft - custom fields template
@mixin am-cc-cft {
  .am-cc-cft {

    // Collapse
    &__collapse {
      display: flex;
      flex-direction: column;
      gap: 8px;

      &-item {
        padding: 16px;
        border: 1px solid var(--am-c-inp-border);
        border-radius: 8px;
        background-color: var(--am-c-main-bgr);

        .el-collapse {
          &-item {
            &__header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              height: unset;
              min-height: 28px;
              padding: 0;
              border: none;
              background-color: transparent;
            }
          }
        }
      }
    }

    // Customer
    &__customer {
      &-name {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 18px;
        font-weight: 500;
        line-height: 1.555556;
        color: var(--am-c-cust-text);

        &[class*='am-no-show-'] {
          border: 1px solid var(--am-c-no-show);
          padding: 0 8px 0 4px;
          border-radius: 6px;
          background-color: var(--am-c-no-show-bgr);
        }

        [class^='am-icon-'] {
          font-size: 28px;
          line-height: 1;
          color: var(--am-c-no-show);
        }

        &.am-no-show-1 {
          --am-c-no-show: var(--am-c-cust-no1);
          --am-c-no-show-bgr: var(--am-c-cust-no1-bgr);
        }

        &.am-no-show-2 {
          --am-c-no-show: var(--am-c-cust-no2);
          --am-c-no-show-bgr: var(--am-c-cust-no2-bgr);
        }

        &.am-no-show-3 {
          --am-c-no-show: var(--am-c-cust-no3);
          --am-c-no-show-bgr: var(--am-c-cust-no3-bgr);
        }
      }

      // Customer Email and Phone
      &-data {
        display: flex;
        align-items: center;
        gap: 0 4px;

        &.am-rw {
          &-420 {
            width: 100%;
          }
        }

        &__wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0 16px;

          &.am-rw {
            &-420 {
              flex-wrap: wrap;
              gap: 4px;
            }
          }
        }

        a {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.42857;
          color: var(--am-c-cust-link);
          text-decoration: none;
        }

        [class^='am-icon-'] {
          font-size: 28px;
          line-height: 0;
          color: var(--am-c-cust-text);
        }
      }
    }

    // Field
    &__fields {
      &.am-rw-420 {
        .am-cc-cft__field {
          width: 100%;
        }
      }

      & > * {
        $count: 100;
        @for $i from 0 through $count {
          &:nth-child(#{$i + 1}) {
            animation: 600ms cubic-bezier(0.45, 1, 0.4, 1.2) #{$i * 100}ms am-animation-slide-up;
            animation-fill-mode: both;
          }
        }
      }
    }

    &__field {
      width: calc(50% - 12px);

      &.am-cf-width-100 {
        width: 100%;
      }

      .el-form-item {
        &__label {
          display: inline-block;
          color: var(--am-c-main-text);
          font-family: var(--am-font-family), sans-serif;
          font-weight: 500;
          line-height: unset;
          margin-bottom: 4px;
          padding: 0;

          &:before {
            color: var(--am-c-error);
          }
        }

        &__error {
          line-height: 1;
          color: var(--am-c-error);
        }

        &__content {
          color: var(--am-c-main-text);
        }
      }

      .el-tooltip__trigger {
        width: 100%;
      }
    }
  }
}

// public
.amelia-v2-booking #amelia-container {
  @include am-cc-cft;
}

// admin
#amelia-app-backend-new #amelia-container {
  @include am-cc-cft;
}
</style>