import axios from 'axios'
import * as utils from './utils.js'

export function online(assetSearch) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  return client
    .post('/api/v1/lfs/_online', assetSearch)
    .then(response => response.data)
    .catch(error => {
      console.error(
        'Unable to retrieve online statuses for local file system assets',
        error,
      )
      return Promise.reject(error)
    })
}
