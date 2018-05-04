import axios from 'axios'
import * as utils from './utils.js'

export function getById(folderId) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  return client.get(`/api/v1/folders/${folderId}`).then(response => {
    return response.data
  })
}
