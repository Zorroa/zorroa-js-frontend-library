import axios from 'axios'
import * as utils from './utils.js'

export function post(payload) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  return client.post('/api/v1/requests', payload).then(response => {
    return response.data
  })
}
