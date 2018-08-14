import axios from 'axios'
import * as utils from './utils.js'

export function get(payload) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  const { type } = payload

  return client
    .get(`/api/v1/processor-lists/defaults/${type}`)
    .then(response => {
      if (response.headers['Content-Type'] === 'text/html') {
        return []
      }

      return response.data.processors
    })
}
