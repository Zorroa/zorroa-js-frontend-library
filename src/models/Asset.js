import Proxy from './Proxy'

export default class Asset {
  constructor ({ id, document }) {
    this.id = id
    this.document = document

    // Build the Proxy list from the ProxySchema
    if (this.document && this.document.proxies && this.document.proxies.proxies) {
      this.proxies = this.document.proxies.proxies.map(proxy => new Proxy(proxy))
    }
  }

  source () { return this.document.source.filename }

  tinyProxy () { return this.document.proxies.tinyProxy }

  aspect () { return this.document.image.width / this.document.image.height }

  backgroundColor () { return this.tinyProxy() ? this.tinyProxy()[5] : getRandomColor() }

  closestProxy (width, height) {
    var bestProxy
    var bestDim = Number.MAX_SAFE_INTEGER
    for (var i in this.proxies) {
      const proxy = this.proxies[i]
      const x = Math.abs(proxy.width - width)
      const y = Math.abs(proxy.height - height)
      const d = Math.max(x, y)
      if (d < bestDim) {
        bestDim = d
        bestProxy = proxy
      }
    }
    return bestProxy
  }
}

function getRandomColor () {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
