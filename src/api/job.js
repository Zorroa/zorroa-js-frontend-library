import axios from 'axios'
import * as utils from './utils.js'

function getFiles(client, jobId) {
  return client.get(`/api/v1/exports/${jobId}/_files`).then(({ data }) => data)
}

export default function job(jobId) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true,
  })

  return {
    files: {
      get: () => getFiles(client, jobId),
    },
  }
}
