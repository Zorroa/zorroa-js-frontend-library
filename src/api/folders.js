import axios from 'axios'
import * as utils from './utils.js'
import Folder from '../models/Folder.js'

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

export function getRootFolder() {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  return client.get(`/api/v1/folders/_root`).then(
    response => {
      const folder = new Folder(response.data)
      return folder
    },
    errorResponse => {
      const isApiEndpointAvailable = errorResponse.status < 500
      if (isApiEndpointAvailable) {
        return new Folder({
          id: Folder.getRootId(),
        })
      }

      return Promise.reject(errorResponse)
    },
  )
}
