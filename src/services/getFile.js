import axios from 'axios'
const client = axios.create({
  withCredentials: true,
  responseType: 'blob'
})

export default function getFile (url, clientOptions = {}) {
  return client
    .get(url, clientOptions)
    .then(response => {
      return response.data
    })
}
