<template>
  <div ref="pageContainer" class="am-cap">
    <CabinetFilters :param-list="paramList" :responsive-class="responsiveClass" />

    <div v-if="pageRenderKey === 'cape'" class="am-cap__actions">
      <AmButton
        prefix="plus"
        size="small"
        category="primary"
        :type="amCustomize.cape.appointments.options.newAppBtn.buttonType"
      >
        <span>{{ amLabels.new_appointment }}</span>
      </AmButton>
    </div>

    <AppointmentsList
      :grouped-appointments="dateGroupedAppointments"
      :page-width="pageWidth"
      :responsive-class="responsiveClass"
    ></AppointmentsList>
  </div>
</template>

<script setup>
// * Import from libraries
import moment from 'moment'

// * Import from Vue
import { ref, computed, inject } from 'vue'

// * Components Width and Height
import { useElementSize } from '@vueuse/core'

// * Import composables
import { useReactiveCustomize } from '../../../../../../../assets/js/admin/useReactiveCustomize.js'

import CabinetFilters from '../parts/Filters.vue'
import AppointmentsList from './parts/AppointmentsList.vue'

// * Composables
import { useResponsiveClass } from '../../../../../../../assets/js/common/responsive'
import AmButton from '../../../../../../_components/button/AmButton.vue'

let pageRenderKey = inject('pageRenderKey')

// * Plugin Licence
let licence = inject('licence')

// * Page Content width
let pageContainer = ref(null)
const { width: pageWidth } = useElementSize(pageContainer)

// * Global labels
let amLabels = inject('labels')

// * Customize
const { amCustomize } = useReactiveCustomize()

let responsiveClass = computed(() => {
  return useResponsiveClass(pageWidth.value)
})

let paramList = ref({
  dates: {
    name: 'dates',
  },
  services: {
    name: 'services',
    icon: 'service',
    ids: [],
  },
  providers: {
    name: 'providers',
    icon: 'employee',
    ids: [],
  },
  locations: {
    name: 'locations',
    icon: 'locations',
    ids: [],
  },
})

if (licence.isStarter) {
  delete paramList.value.locations
}

if (pageRenderKey.value === 'cape') {
  delete paramList.value.providers
  paramList.value.customers = {
    name: 'customers',
    icon: 'user',
    ids: [],
  }
}

let arrApp = [
  {
    when: 0,
    name: 'Entrepreneurial and private clients',
    status: 'approved',
  },
  {
    when: 0,
    name: 'Family business services',
    status: 'approved',
  },
  {
    when: 2,
    name: 'Sustainability and climate change',
    status: 'pending',
  },
  {
    when: 2,
    name: 'Audit and assurance',
    status: 'canceled',
  },
  {
    when: 5,
    name: 'Industrial engineering',
    status: 'rejected',
  },
  {
    when: 5,
    name: 'Operations management',
    status: 'pending',
  },
  {
    when: 5,
    name: 'Organizational Development',
    status: 'approved',
  },
]

let dateGroupedAppointments = ref({})

arrApp.forEach((item, index) => {
  if (
    Object.keys(dateGroupedAppointments.value).indexOf(
      moment().add(item.when, 'days').format('YYYY-MM-DD'),
    ) < 0
  ) {
    dateGroupedAppointments.value[moment().add(item.when, 'days').format('YYYY-MM-DD')] = {}
    dateGroupedAppointments.value[moment().add(item.when, 'days').format('YYYY-MM-DD')].date =
      moment().add(item.when, 'days').format('YYYY-MM-DD')
    dateGroupedAppointments.value[
      moment().add(item.when, 'days').format('YYYY-MM-DD')
    ].appointments = []
  }

  let app = {
    id: index,
    bookingEnd: `${moment().add(item.when, 'days').format('YYYY-MM-DD')} 08:10:00`,
    bookingStart: `${moment().add(item.when, 'days').format('YYYY-MM-DD')} 08:00:00`,
    bookings: [
      {
        actionsCompleted: null,
        aggregatedPrice: true,
        appointmentId: 1,
        coupon: null,
        couponId: null,
        created: '2023-10-02 13:46:48',
        customFields: [
          { id: 1, type: 'text', label: 'Custom field 1', value: 'Text value', width: 50 },
          {
            id: 2,
            type: 'select',
            label: 'Custom field 2',
            value: 'Option 1',
            width: 50,
            options: [{ label: 'Option 1' }, { label: 'Option 2' }],
          },
          {
            id: 3,
            type: 'checkbox',
            label: 'Custom field 3',
            value: ['Option 1'],
            width: 50,
            options: [{ label: 'Option 1' }, { label: 'Option 2' }],
          },
          {
            id: 4,
            type: 'datepicker',
            label: 'Custom field 4',
            value: moment().toDate(),
            width: 50,
          },
          {
            id: 5,
            type: 'text-area',
            label: 'Custom field 5',
            value: 'Longer text value',
            width: 100,
          },
        ],
        customer: {
          birthday: null,
          countryPhoneIso: 'us',
          email: 'testjanedoe@test.com',
          externalId: null,
          firstName: 'Jane',
          gender: null,
          id: 1,
          lastName: 'Doe',
          note: null,
          phone: '+15056260628',
          pictureFullPath: null,
          pictureThumbPath: null,
          status: 'visible',
          translations: null,
          type: 'customer',
          zoomUserId: null,
        },
        customerId: 1,
        duration: null,
        extras: [
          {
            aggregatedPrice: false,
            customerBookingId: 2443,
            description: '',
            duration: 1800,
            extraId: 1,
            id: 1,
            maxQuantity: 5,
            name: 'Extra 1',
            position: 1,
            price: 10,
            quantity: 2,
            serviceId: null,
            translations: null,
          },
          {
            aggregatedPrice: false,
            customerBookingId: 2443,
            description: '',
            duration: 1800,
            extraId: 2,
            id: 2,
            maxQuantity: 5,
            name: 'Extra 2',
            position: 2,
            price: 20,
            quantity: 3,
            serviceId: null,
            translations: null,
          },
          {
            aggregatedPrice: false,
            customerBookingId: 2443,
            description: '',
            duration: 1800,
            extraId: 3,
            id: 3,
            maxQuantity: 5,
            name: 'Extra 3',
            position: 3,
            price: 15,
            quantity: 1,
            serviceId: null,
            translations: null,
          },
        ],
        id: 1,
        info: '{"firstName":"Jane","lastName":"Doe","phone":null,"locale":"en_US","timeZone":"Europe\\/Belgrade","urlParams":null}',
        isChangedStatus: null,
        isLastBooking: null,
        isUpdated: null,
        packageCustomerService: {
          bookingsCount: null,
          id: 243,
          locationId: null,
          packageCustomer: {
            bookingsCount: null,
            coupon: null,
            couponId: null,
            customerId: null,
            end: null,
            id: null,
            packageId: null,
            payments: [],
            price: null,
            purchased: null,
            start: null,
            status: null,
          },
          providerId: null,
          serviceId: null,
        },
        payments: [],
        persons: 1,
        price: 0,
        status: item.status,
        ticketsData: [],
        token: null,
        utcOffset: null,
      },
    ],
    cancelable: true,
    googleCalendarEventId: null,
    googleMeetUrl: '#',
    internalNotes: '',
    isFull: null,
    isGroup: false,
    isRescheduled: null,
    lessonSpace: '#',
    location: 'Location 1',
    locationId: 1,
    notifyParticipants: 1,
    outlookCalendarEventId: null,
    microsoftTeamsUrl: '#',
    parentId: null,
    past: false,
    provider: {
      firstName: 'John',
      lastName: 'Doe',
    },
    providerId: 1,
    reschedulable: true,
    resources: [],
    service: {
      name: item.name,
    },
    serviceId: index,
    status: item.status,
    type: 'appointment',
    zoomMeeting: {
      joinUrl: '#',
    },
  }

  dateGroupedAppointments.value[
    moment().add(item.when, 'days').format('YYYY-MM-DD')
  ].appointments.push(app)
})
</script>

<script>
export default {
  name: 'CabinetAppointments',
  key: 'appointments',
}
</script>

<style lang="scss">
@mixin am-cabinet-appointments {
  .am-cap {
    &__actions {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin: 0 0 16px;

      .am-button {
        .am-icon-plus {
          font-size: 24px;
        }
      }
    }
  }
}

#amelia-app-backend-new #amelia-container {
  @include am-cabinet-appointments;
}
</style>
