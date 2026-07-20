import { inject, nextTick, provide, ref } from 'vue'

const LIVE_ANNOUNCER_KEY = Symbol('liveAnnouncer')

function setLiveMessage(target, message) {
  if (!message) {
    return
  }

  target.value = ''

  nextTick(() => {
    target.value = message
  })
}

export function provideLiveAnnouncer() {
  const statusMessage = ref('')
  const alertMessage = ref('')

  function announceStatus(message) {
    setLiveMessage(statusMessage, message)
  }

  function announceAlert(message) {
    setLiveMessage(alertMessage, message)
  }

  const announcer = {
    statusMessage,
    alertMessage,
    announceStatus,
    announceAlert,
  }

  provide(LIVE_ANNOUNCER_KEY, announcer)

  return announcer
}

export function useLiveAnnouncer() {
  return inject(LIVE_ANNOUNCER_KEY, {
    statusMessage: ref(''),
    alertMessage: ref(''),
    announceStatus: () => {},
    announceAlert: () => {},
  })
}

export function announceFormErrors(formRef, announceAlert) {
  if (!formRef?.value?.fields) {
    return
  }

  const errorField = formRef.value.fields.find((field) => field.validateState === 'error')

  if (!errorField) {
    return
  }

  const errorElement = errorField.$el?.querySelector('.el-form-item__error')
  const message = errorElement?.textContent?.trim() || errorField.validateMessage

  if (message) {
    announceAlert(message)
  }
}
