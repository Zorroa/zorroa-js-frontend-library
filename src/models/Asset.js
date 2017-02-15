import * as assert from 'assert'

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
  url (protocol, host) {
    return `${protocol}//${host}:8066/api/v1/assets/${this.id}/_stream`
  }
  mediaType () { return this.document.source.mediaType || 'unknown' }
  tinyProxy () { return this.document.proxies ? this.document.proxies.tinyProxy : null }

  width () {
    if (this.document.image) return this.document.image.width
    if (this.document.video) return this.document.video.width
  }
  height () {
    if (this.document.image) return this.document.image.height
    if (this.document.video) return this.document.video.height
  }

  aspect () { return this.width() / Math.max(1, this.height()) }

  backgroundColor () { return this.tinyProxy() ? this.tinyProxy()[5] : getRandomColor() }

  startPage () {
    if (this.document.source.clip && this.document.source.clip.page) return this.document.source.clip.page.start
  }

  frameRate () {    // frames per second
    if (this.document.video) return this.document.video.frameRate
  }
  frames () {       // total # frames in the source video -- the entire film, not the clip
    if (this.document.video) return this.document.video.frames
  }
  frameRange () {   // number of frames in this clip -- a subset of frames()
    if (this.document.video) return this.stopFrame() - this.startFrame()
  }
  duration () {     // seconds in this clip -- a subset of the entire film
    if (this.document.video) return this.frameRange() / this.frameRate()
  }
  startFrame () {   // start frame for this clip -- >= 0
    if (this.document.video) {
      if (this.document.source.clip && this.document.source.clip.frame) return this.document.source.clip.frame.start
      return 0
    }
  }
  stopFrame () {    // stop frame for this clip -- <= frames()
    if (this.document.video) {
      if (this.document.source.clip && this.document.source.clip.frame) return this.document.source.clip.frame.stop
      return this.document.video.frames
    }
  }

  smallestProxy () {
    if (!this.proxies) return null
    var smallestProxy = this.proxies[0]
    var leastPixels = Number.MAX_SAFE_INTEGER
    for (var i = 0; i < this.proxies.length; ++i) {
      const proxy = this.proxies[i]
      const pixels = proxy.width * proxy.height
      if (pixels < leastPixels) {
        leastPixels = pixels
        smallestProxy = proxy
      }
    }
    return smallestProxy
  }

  biggestProxy () {
    if (!this.proxies) return null
    var biggestProxy = this.proxies[0]
    var mostPixels = 0
    for (var i = 0; i < this.proxies.length; ++i) {
      const proxy = this.proxies[i]
      const pixels = proxy.width * proxy.height
      if (pixels > mostPixels) {
        mostPixels = pixels
        biggestProxy = proxy
      }
    }
    return biggestProxy
  }

  closestProxy (width, height) {
    if (!this.proxies) return null
    var bestProxy = this.proxies[0]
    var bestDim = Number.MAX_SAFE_INTEGER
    for (var i = 0; i < this.proxies.length; ++i) {
      const proxy = this.proxies[i]
      const x = Math.abs(proxy.width - width)
      const y = Math.abs(proxy.height - height)
      const d = Math.min(x, y)
      if (d < bestDim) {
        bestDim = d
        bestProxy = proxy
      }
    }
    return bestProxy
  }

  parentId () {
    if (!this.document.source || !this.document.source.clip) return null
    return this.document.source.clip.parent
  }

  parentProxyURL (protocol, host) {
    const parentId = this.parentId()
    if (!parentId) return null
    const smallestProxy = this.smallestProxy()
    if (!smallestProxy) return null
    const { width, height, format } = smallestProxy
    const id = `proxy/${this.parentId()}_${width}x${height}.${format}`
    return `${protocol}//${host}:8066/api/v1/ofs/${id}`
  }

  // Returns true if the asset is in any of the folder ids
  memberOfAnyFolderIds (folderIds) {
    const folders = this.document && this.document.links && this.document.links.folder
    if (!folders || !folders.length) return false
    for (const folderId of folderIds) {
      const index = folders.findIndex(id => (id === folderId))
      if (index >= 0) return true
    }
    return false
  }

  // Returns true if the asset is in all of the folder ids
  memberOfAllFolderIds (folderIds) {
    const folders = this.document && this.document.links && this.document.links.folder
    if (!folders || !folders.length) return false
    for (const folderId of folderIds) {
      const index = folders.findIndex(id => (id === folderId))
      if (index < 0) return false
    }
    return true
  }

  static lastNamespace (field) {
    if (field && field.length) {
      const namespaces = field.split('.')
      let index = namespaces.length - 1
      let name = namespaces[index]
      if (index > 0 && (name === 'raw' || name === 'point')) {
        name = namespaces[index - 1]
      }
      return name
    }
  }

  // Return the value for a metadata field specified using dot-notation
  // as a path through the JSON-structured asset document. Recursively
  // invokes _field to navigate through the JSON and then uses
  // _valueToString to get a displayable form of the value.
  value (field) {
    return Asset._valueToString(Asset._field(this.document, field))
  }

  // Return the value for a metadata field specified using dot-notation
  // as a path through the JSON-structured asset document. Recursively
  // invokes _field to navigate through the JSON and then uses
  // _valueToString to get a displayable form of the value.
  rawValue (field) {
    return Asset._field(this.document, field)
  }

  static _field (obj, key) {
    const idx = key.indexOf('.')
    if (idx >= 0) {
      const namespace = key.slice(0, idx)
      const nextkey = key.slice(idx + 1)
      const value = obj[namespace]
      if (!value) {
        return
      }
      assert.ok(typeof value === 'object', 'non-object namespace')
      return Asset._field(value, nextkey)
    }

    // // E.g. proxies, an array of objects
    // // FIXME: Unify array management with _valueToString
    // if (Array.isArray(obj) || obj instanceof Array) {
    //   let array = '['
    //   obj.map((f, i) => {
    //     array += Asset._field(f, key)
    //     array += ', '
    //   })
    //   array = array.slice(0, array.length - 2)
    //   array += ']'
    //   return array
    // }

    return obj[key]
  }

  static _valueToString (value) {
    // E.g. tinyProxy, an array of POD
    // FIXME: Unify array management with _field
    if (Array.isArray(value) || value instanceof Array) {
      let array = '['
      value.map((f, i) => {
        array += Asset._valueToString(f)
        array += ', '
      })
      array = array.slice(0, array.length - 2)
      array += ']'
      return array
    }

    assert.ok(!(value instanceof Object || typeof value === 'object'), 'object field')
    if (value instanceof String || typeof value === 'string') {
      return value
    }
    if (value instanceof Number || typeof value === 'number') {
      return value.toLocaleString()
    }
  }

  terms (field) {
    return Asset._terms(this.document, field)
  }

  static _terms (obj, key) {
    const idx = key.indexOf('.')
    if (idx >= 0) {
      const namespace = key.slice(0, idx)
      const nextkey = key.slice(idx + 1)
      const value = obj[namespace]
      if (!value) {
        return
      }
      assert.ok(typeof value === 'object', 'non-object namespace')
      return Asset._terms(value, nextkey)
    }
    if (Array.isArray(obj) || obj instanceof Array) {
      return obj
    }

    return obj[key]
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
