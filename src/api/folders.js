import axios from 'axios'
import * as utils from './utils.js'
import Folder from '../models/Folder.js'

const SPRING_METHOD_NOT_SUPPORTED =
  'org.springframework.web.HttpRequestMethodNotSupportedException'
const METHOD_NOT_SUPPORTED = 405
const NOT_FOUND = 404

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
      const isApiEndpointAvailabnle =
        errorResponse.status === METHOD_NOT_SUPPORTED ||
        errorResponse.status === NOT_FOUND ||
        errorResponse.data.cause === SPRING_METHOD_NOT_SUPPORTED
      if (isApiEndpointAvailabnle) {
        return new Folder({
          id: Folder.getRootId(),
        })
      }

      console.error(
        'Encountered unexpected error'.JSON.stringify(errorResponse),
      )
      return Promise.reject(errorResponse)
    },
  )
}
