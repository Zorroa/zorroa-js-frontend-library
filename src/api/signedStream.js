import axios from 'axios'
import * as utils from './utils.js'

function getStream(client, { id }) {
  return client
    .get(`/${id}/_stream`)
    .then(response => {
      return response.data.data
    })
    .catch(utils.handleError)
}

function headStream(client, { id }) {
  return client
    .head(`/${id}/_stream`)
    .then(response => {
      return {
        signedUrl: response.headers['x-zorroa-signed-url'],
      }
    })
    .catch(error => {
      // The 405 check is a V39 -> V40 shim to ensure backwards compatability
      if (error.response.status === 405) {
        return {
          signedUrl: undefined,
        }
      }

      return utils.handleError(error)
    })
}

export default function stream() {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: `${origin}/api/v1/assets`,
    withCredentials: true,
  })

  return {
    get: options => {
      return getStream(client, {
        id: options.id,
        extension: options.extension,
      })
    },
    head: options => {
      return headStream(client, {
        id: options.id,
        extension: options.extension,
      })
    },
  }
}
