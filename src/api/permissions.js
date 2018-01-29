import axios from 'axios'
import * as utils from './utils.js'

export function get () {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true
  })

  return client.get('/api/v1/users')
}
