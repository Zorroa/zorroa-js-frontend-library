import axios from 'axios'
import * as utils from './utils.js'

function getBlob (client, {feature, name}) {
  return client
    .get(`/${feature}/${name}`)
    .then((response) => {
      return response.data.data
    })
    .catch(utils.handleError)
}

function postBlob (client, {feature, name, payload}) {
  return client
    .post(`/${feature}/${name}`, payload)
    .then((response) => {
      return response.data.data
    })
    .catch(utils.handleError)
}

export default function blob (app) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: `${origin}/api/v1/blobs/${app}`,
    withCredentials: true
  })

  return {
    get: (config) => {
      return getBlob(client, {
        feature: config.feature,
        name: config.name
      })
    },
    post: (config) => {
      return postBlob(client, {
        feature: config.feature,
        name: config.name,
        payload: config.payload
      })
    }
  }
}
