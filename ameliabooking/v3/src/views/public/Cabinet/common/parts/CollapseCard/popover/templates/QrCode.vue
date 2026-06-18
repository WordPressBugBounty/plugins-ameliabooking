<template>
  <div
    ref="qrCodesRef"
    class="am-cc__qr-codes"
  >
    <div
      v-if="errorMessage"
      class="am-cc__qr-codes__message"
      role="alert"
      aria-live="assertive"
    >
      <span class="am-icon-info-reverse"></span>
      {{errorMessage}}
    </div>
    <ul
      class="am-cc__qr-codes__list"
      role="list"
      aria-label="Available QR code documents"
    >
      <li
      v-for="(item, index) in props.data"
      :key="index"
      class="am-cc__qr-codes__item"
      >
        <AmButton
          class="am-cc__qr-codes__button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          :aria-label="`Open ${getTicketLabel(item)} PDF`"
          @click="showQrCodes(item)"
        >
          {{ getTicketLabel(item) }}
        </AmButton>
      </li>
    </ul>
  </div>
</template>

<script setup>
// * Import from Vue
import { ref, onMounted, nextTick } from 'vue'

// * Import from Vuex
import { useStore } from 'vuex'

// * Composables
import httpClient from '../../../../../../../../plugins/axios'
import AmButton from "@/views/_components/button/AmButton.vue";

// * Store
const store = useStore()

// * Props
let props = defineProps({
  data: {
    type: [Array],
  },
})

let errorMessage = ref('')
let loading = ref(false)
let qrCodesRef = ref(null)

function getTicketLabel(ticket) {
  return `${ticket.eventName} - ${ticket.type === 'ticket' ? 'Single Ticket.pdf' : 'Group Ticket.pdf'}`
}

function showQrCodes(ticket) {
  if (loading.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  httpClient
    .get(
      '/etickets',
      Object.assign(
        {
          params: {
            source: 'cabinet-customer',
            timeZone: store.getters['cabinet/getTimeZone'],
            eventId: ticket.eventId,
            bookingId: ticket.bookingId,
            ticketManualCode: ticket.ticketManualCode,
          },
        }
      )
    )
    .then((response) => {
      window.open(createFileUrlFromResponse(response.data))
    })
    .catch((error) => {
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage.value = error.response.data.message
      } else {
        errorMessage.value = 'An error occurred while fetching the QR code.'
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function createFileUrlFromResponse(pdfData) {
  const byteCharacters = atob(pdfData)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const file = new Blob([byteArray], { type: 'application/pdf;base64' })
  return URL.createObjectURL(file)
}

onMounted(() => {
  errorMessage.value = ''

  nextTick(() => {
    const firstFocusable = qrCodesRef.value?.querySelector('button:not([disabled])')
    firstFocusable?.focus()
  })
})
</script>

<style lang="scss">
@mixin popover-template-qr-code {
  .am-cc__qr-codes {
    display: flex;
    flex-direction: column;
    max-width: 480px;
    gap: 6px;

    &__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    &__message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      background-color: var(--am-c-cc-error-op15);
      color: var(--am-c-cc-error);
      text-align: center;
      font-size: 14px;
      line-height: 20px;

      span {
        font-size: 18px;
        line-height: 20px;
      }
    }

    &__item {
      margin: 0;
    }

    &__button {
      width: 100%;
      padding: 6px 12px;
      border-radius: 4px;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      font-size: 14px;
      color: var(--am-c-cc-text);
      transition: color 0.3s;

      &:hover {
        color: var(--am-c-cc-primary);
      }

      &:focus-visible {
        outline: 2px solid var(--am-c-cc-text);
        outline-offset: 2px;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.el-popover {
  @include popover-template-qr-code;
}
</style>
