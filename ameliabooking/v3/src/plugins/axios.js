import axios from 'axios'

const baseURL = window.wpAmeliaUrls.wpAmeliaPluginAjaxURL

const params = {
  wpAmeliaNonce: window.wpAmeliaNonce,
}

const httpClient = axios.create({
  baseURL,
  params,
  withCredentials: true,
})

httpClient.interceptors.response.use((response) => {
  const nonce = response?.data?.data?.wpAmeliaNonce

  if (nonce) {
    window.wpAmeliaNonce = nonce
    httpClient.defaults.params.wpAmeliaNonce = nonce
  }

  return response
})

export default httpClient
