export default class Proxy {
  constructor ({ id, width, height, format }) {
    this.id = id
    this.width = width
    this.height = height
    this.format = format
  }

  url (protocol, host) {
    return `${protocol}//${host}:8066/api/v1/ofs/${this.id}`
  }
}
