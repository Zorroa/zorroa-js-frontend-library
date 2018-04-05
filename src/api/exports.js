import axios from 'axios'
import * as utils from './utils.js'

export function post(payload) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  const { name, search, processors } = payload

  return client
    .post('/api/v1/exports', {
      name,
      search,
      processors,
    })
    .then(response => {
      return response.data
    })
}
