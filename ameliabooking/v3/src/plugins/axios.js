import axios from 'axios'

const baseURL = window.wpAmeliaUrls.wpAmeliaPluginAjaxURL

const httpClient = axios.create({
  baseURL,
  params: {},
  withCredentials: true,
})

/**
 * Make the given nonce the one used from now on.
 * Booking endpoints hand back a refreshed nonce whenever the WP user changed
 * during the request, and redirect gateways ship one with the restored cache.
 */
export function useAmeliaNonce(nonce) {
  if (!nonce) {
    return
  }

  window.wpAmeliaNonce = nonce
  httpClient.defaults.params.wpAmeliaNonce = nonce
}

// Read the nonce when the request is made, not when this module is evaluated,
// so a nonce set after boot (restore, refreshed nonce) is always picked up.
httpClient.interceptors.request.use((config) => {
  if (window.wpAmeliaNonce) {
    config.params = { ...config.params, wpAmeliaNonce: window.wpAmeliaNonce }
  }

  return config
})

httpClient.interceptors.response.use((response) => {
  useAmeliaNonce(response?.data?.data?.wpAmeliaNonce)

  return response
})

export default httpClient
