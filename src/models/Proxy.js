export default class Proxy {
  constructor ({ id, width, height, format }) {
    this.id = id
    this.width = width
    this.height = height
    this.format = format
  }

  url (host) {
    return `https://${host}:8066/api/v1/ofs/${this.id}`
  }
}
