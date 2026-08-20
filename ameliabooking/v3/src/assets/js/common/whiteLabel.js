import { settings } from '../../../plugins/settings.js'

export const DEFAULT_SUPPORT_EMAIL = 'support@wpamelia.com'

/**
 * Support email shown in customize previews.
 * When White Label is enabled and a plugin name is set, use support@{{pluginName}}.com.
 *
 * @param {Object} [amSettings]
 * @returns {string}
 */
export function getSupportEmail(amSettings = settings) {
  const whiteLabelEnabled = Boolean(amSettings?.featuresIntegrations?.whiteLabel?.enabled)
  const pluginName = amSettings?.whiteLabel?.pluginName?.trim()

  if (whiteLabelEnabled && pluginName) {
    return `support@${pluginName}.com`
  }

  return DEFAULT_SUPPORT_EMAIL
}
