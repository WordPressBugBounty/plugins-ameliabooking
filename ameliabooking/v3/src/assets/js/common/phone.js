import { parsePhoneNumberFromString } from 'libphonenumber-js'

/**
 * Returns phone value with country calling code (e.g. +381641234567).
 *
 * @param {string|number|null|undefined} value
 * @param {import('maz-ui/components').MazInputPhoneNumberData|null|undefined} phoneData
 * @param {string|undefined|null} countryCode
 * @returns {string}
 */
export function getInternationalPhoneValue(value, phoneData, countryCode) {
  const normalizedValue = value == null ? '' : String(value).trim()

  if (!normalizedValue && !phoneData?.nationalNumber) {
    return ''
  }

  if (phoneData?.e164) {
    return phoneData.e164
  }

  if (phoneData?.formatInternational) {
    return phoneData.formatInternational.replace(/\s+/g, '')
  }

  if (normalizedValue.startsWith('+')) {
    return normalizedValue.replace(/\s+/g, '')
  }

  const country = (phoneData?.countryCode || phoneData?.parsedCountryCode || countryCode || '')
    .toString()
    .toUpperCase()

  if (country && normalizedValue) {
    const parsed = parsePhoneNumberFromString(normalizedValue, country)

    if (parsed) {
      return parsed.format('E.164')
    }
  }

  if (phoneData?.countryCallingCode && phoneData?.nationalNumber) {
    return `+${phoneData.countryCallingCode}${phoneData.nationalNumber}`
  }

  if (phoneData?.countryCallingCode && normalizedValue) {
    const nationalDigits = normalizedValue.replace(/\D/g, '')

    return nationalDigits ? `+${phoneData.countryCallingCode}${nationalDigits}` : ''
  }

  return normalizedValue
}
