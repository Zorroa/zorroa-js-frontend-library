import axios from 'axios'
const client = axios.create({
  withCredentials: true,
  responseType: 'blob',
})

export default function getImage(url, clientOptions = {}) {
  return client.get(url, clientOptions).then(response => {
    if (clientOptions.format === 'blob') {
      return response.data
    }

    // A Blob instance is converted to an ImageBitmap instance aysync
    return window.createImageBitmap(response.data)
  })
}
