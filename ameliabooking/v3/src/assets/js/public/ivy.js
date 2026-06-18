import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { settings } from '../../../plugins/settings'

function getCountryIsoMutation (store) {
  return store.getters['booking/getBookableType'] === 'event'
    ? 'customerInfo/setCustomerCountryPhoneIso'
    : 'booking/setCustomerCountryPhoneIso'
}

function applyIvyPhoneValue (store, infoFormData, rawPhone) {
  const value = rawPhone == null ? '' : String(rawPhone).trim()

  if (!value) {
    return false
  }

  const countryIsoMutation = getCountryIsoMutation(store)
  let parsed = parsePhoneNumberFromString(value)

  if (!parsed?.isValid?.()) {
    const defaultCountry = store.state.settings?.general?.phoneDefaultCountryCode

    if (defaultCountry && defaultCountry !== 'auto') {
      parsed = parsePhoneNumberFromString(value, defaultCountry.toUpperCase())
    }
  }

  if (parsed) {
    if (parsed.country) {
      store.commit(countryIsoMutation, parsed.country.toLowerCase())
    }

    // MazInputPhoneNumber expects international format for v-model.
    infoFormData.value.phone = parsed.formatInternational()
    return true
  }

  infoFormData.value.phone = value
  return true
}

function useIvyMapping (store, shortcodeData, infoFormData) {
  const formId = shortcodeData.value?.ivy?.formId
  const ivyValues = shortcodeData.value?.ivy?.values
  let phoneMapped = false

  if (
      formId &&
      settings?.ivy &&
      formId in settings.ivy
  ) {
    const formMapping = settings.ivy[formId]

    if (
      formMapping &&
      ivyValues &&
      typeof ivyValues === 'object'
    ) {
      const keys = ['firstName', 'lastName', 'email', 'phone']

      keys.forEach(key => {
        const fieldMapping = formMapping[key]

        if (key in formMapping && fieldMapping) {
          const formKey = fieldMapping.type + '_' + fieldMapping.index

          if (!(formKey in ivyValues)) {
            return
          }

          const ivyValue = ivyValues[formKey]
          const currentValue = infoFormData.value[key]
          const hasIvyValue = ivyValue != null && String(ivyValue).trim() !== ''
          const shouldMap = hasIvyValue && (key === 'phone' || !currentValue)

          if (!shouldMap) {
            return
          }

          if (fieldMapping.type === 'name') {
            const nameFieldKey = fieldMapping.key
            const nameValues = ivyValues[formKey]

            if (
              nameFieldKey &&
              nameValues &&
              typeof nameValues === 'object' &&
              nameFieldKey in nameValues
            ) {
              infoFormData.value[key] = nameValues[nameFieldKey]
            }
          } else if (key === 'phone') {
            phoneMapped = applyIvyPhoneValue(store, infoFormData, ivyValue) || phoneMapped
          } else {
            infoFormData.value[key] = ivyValue
          }
        }
      })
    }
  }

  return phoneMapped
}

export {
    useIvyMapping,
}
