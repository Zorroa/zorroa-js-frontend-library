// curator/api/whitelabel

import axios from 'axios'
import * as utils from './utils.js'

function getWhitelabel(client) {
  return client
    .get(`/curator/api/whitelabel`)
    .then(response => {
      return response.data
    })
    .catch(utils.handleError)
}

export default function stream() {
  const client = axios.create({})

  return {
    get: () => {
      return getWhitelabel(client)
    },
  }
}
