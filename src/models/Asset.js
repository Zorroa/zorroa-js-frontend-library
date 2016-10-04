export default class Asset {
  constructor ({ id, document }) {
    this.id = id
    this.document = document
  }

  source () { return this.document.source.filename }

  tinyProxy () { return this.document.proxies.tinyProxy }

  proxyLevels () { return this.document.proxies.proxies.length }

  proxy(level) { return this.document.proxies.proxies[level] }

  aspect() { return this.document.image.width / this.document.image.height }

  backgroundColor () { return this.tinyProxy() ? this.tinyProxy()[5] : getRandomColor() }
}
