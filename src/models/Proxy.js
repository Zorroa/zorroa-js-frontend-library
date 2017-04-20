export default class Proxy {
  constructor ({ id, width, height, format }) {
    this.id = id
    this.width = width
    this.height = height
    this.format = format
  }

  url (origin) {
    return `${origin}/api/v1/ofs/${this.id}`
  }
}
