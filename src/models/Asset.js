import * as assert from 'assert'

import Proxy from './Proxy'

export default class Asset {
  constructor ({ id, score, document }) {
    this.id = id
    this.score = score
    this.document = document

    // Build the Proxy list from the ProxySchema
    if (this.document && this.document.proxies && this.document.proxies.proxies) {
      this.proxies = this.document.proxies.proxies.map(proxy => new Proxy(proxy))
    }
  }

  source () { return this.document.source && this.document.source.filename }

  static endpoint (origin, id) {
    return `${origin}/api/v1/assets/${id}`
  }

  static _url (id, origin) {
    return Asset.endpoint(origin, id) + '/_stream'
  }

  url (origin) {
    return Asset._url(this.id, origin)
  }

  static _closestProxyURL (id, origin, width, height) {
    return `${Asset.endpoint(origin, id)}/proxies/closest/${Math.round(width)}x${Math.round(height)}`
  }

  closestProxyURL (origin, width, height) {
    return Asset._closestProxyURL(this.id, origin, width, height)
  }

  static _largestProxyURL (id, origin) {
    return Asset.endpoint(origin, id) + '/proxies/largest'
  }

  largestProxyURL (origin) {
    return Asset._largestProxyURL(this.id, origin)
  }

  static _smallestParentProxyURL (parentId, origin) {
    if (!parentId) return null
    return Asset.endpoint(origin, parentId) + '/proxies/smallest'
  }

  smallestParentProxyURL (origin) {
    return Asset._smallestParentProxyURL(this.parentId(), origin)
  }

  backgroundURL (origin) {
    const id = this.rawValue('video.background')
    if (!id) return
    return Asset.ofsURL(id, origin)
  }

  static ofsURL (id, origin) {
    return `${origin}/api/v1/ofs/${id}`
  }

  mediaType () { return (this.document.source && this.document.source.mediaType) || 'unknown' }
  tinyProxy () { return (this.document.proxies && (this.document.proxies ? this.document.proxies.tinyProxy : null)) }

  width () {
    if (this.document.image) return this.document.image.width
    if (this.document.video) return this.document.video.width
  }
  height () {
    if (this.document.image) return this.document.image.height
    if (this.document.video) return this.document.video.height
  }

  aspect () { return this.width() / Math.max(1, this.height()) }

  proxyAspect () {
    const proxy = this.biggestProxy()
    if (proxy) return proxy.width / Math.max(1, proxy.height)
  }

  backgroundColor () { return this.tinyProxy() ? this.tinyProxy()[5] : getRandomColor() }

  pageCount () {
    if (this.document.source && this.document.source.clip && this.document.source.clip.pages) return this.document.source.clip.pages
    if (this.document.document && this.document.document.pages) return this.document.document.pages
    if (this.document.image && this.document.image.pages) return this.document.image.pages
    if (this.document.video && this.document.video.pages) return this.document.video.pages
  }

  startPage () {
    if (this.document.source && this.document.source.clip && this.document.source.clip.page) return this.document.source.clip.page.start
  }

  stopPage () {
    if (this.document.source && this.document.source.clip && this.document.source.clip.page) return this.document.source.clip.page.stop
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
    if (this.document.video) return this.frameRange() / (this.frameRate() || 30)
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
      return this.document.video.frames - 1
    }
  }
  validVideo () {
    if (!this.frameRate()) return false
    if (!this.frames()) return false
    if (!this.frameRange()) return false
    return true
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

  addFolderIds (folderIds) {
    const folders = this.document && this.document.links && this.document.links.folder
    if (!folders || !folders.length) {
      if (!this.document.links) this.document.links = {}
      this.document.links.folder = [...folderIds]
    } else {
      const newFolderIds = new Set([...folderIds])
      folderIds.forEach(id => newFolderIds.add(id))
      this.document.links.folder = [...newFolderIds]
    }
  }

  removeFolderIds (folderIds) {
    const folders = this.document && this.document.links && this.document.links.folder
    if (folders && folders.length) {
      const newFolderIds = new Set([...folders])
      folderIds.forEach(id => newFolderIds.delete(id))
      this.document.links.folder = [...newFolderIds]
    }
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

  findRawValue (fields) {
    for (let i = 0; i < fields.length; ++i) {
      const val = this.rawValue(fields[i])
      if (val !== undefined) return val
    }
    return undefined
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
    if (field === 'id' || field === 'score') return this[field]
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

export function minimalUniqueFieldTitle (field, fields, minIndex) {
  const types = ['point', 'bit', 'byte', 'raw']
  const names = field.split('.')
  if (!names || names.length < 2) return { head: field }
  let title, head, tails
  for (let i = names.length - 1; i >= minIndex; --i) {
    if (i === names.length - 1 && types.findIndex(t => t === names[i]) >= 0) continue
    if (!head) {
      head = names[i]
    } else if (!tails) {
      tails = [names[i]]
    } else {
      tails.push(names[i])
    }
    if (!title) {
      title = names[i]
    } else {
      title = names[i] + '.' + title
    }
    const matchesAnotherField = fields.findIndex(f => f !== field && f.endsWith(title)) >= 0
    if (!matchesAnotherField) return { head, tails }
  }
  return { head, tails }
}
