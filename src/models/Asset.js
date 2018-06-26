import * as assert from 'assert'

import Proxy from './Proxy'
import Timecode from '../services/Timecode'

export default class Asset {
  constructor({ id, score, document }) {
    this.id = id
    this.score = score
    this.document = document

    // Build the Proxy list from the ProxySchema
    if (
      this.document &&
      this.document.proxies &&
      this.document.proxies.proxies
    ) {
      this.proxies = this.document.proxies.proxies.map(
        proxy => new Proxy(proxy),
      )
    }
  }

  source() {
    return this.document.source && this.document.source.filename
  }

  static endpoint(origin, id) {
    return `${origin}/api/v1/assets/${id}`
  }

  static _url(id, origin) {
    return Asset.endpoint(origin, id) + '/_stream'
  }

  url(origin) {
    return Asset._url(this.id, origin)
  }

  static _closestProxyURL(id, origin, width, height) {
    return `${Asset.endpoint(origin, id)}/proxies/closest/${Math.round(
      width,
    )}x${Math.round(height)}`
  }

  closestProxyURL(origin, width, height) {
    return Asset._closestProxyURL(this.id, origin, width, height)
  }

  atLeastProxyURL(origin, width, height) {
    const id = this.id
    const largestDimension = Math.round(Math.max(width, height))

    return `${Asset.endpoint(origin, id)}/proxies/atLeast/${largestDimension}`
  }

  static _largestProxyURL(id, origin) {
    return Asset.endpoint(origin, id) + '/proxies/largest'
  }

  largestProxyURL(origin) {
    return Asset._largestProxyURL(this.id, origin)
  }

  static _smallestParentProxyURL(parentId, origin) {
    if (!parentId) return null
    return Asset.endpoint(origin, parentId) + '/proxies/smallest'
  }

  smallestParentProxyURL(origin) {
    return Asset._smallestParentProxyURL(this.parentId(), origin)
  }

  backgroundURL(origin) {
    const id = this.rawValue('video.background')
    if (!id) return
    return Asset.ofsURL(id, origin)
  }

  static ofsURL(id, origin) {
    return `${origin}/api/v1/ofs/${id}`
  }

  mediaType() {
    return (this.document.source && this.document.source.mediaType) || 'unknown'
  }

  isOfType(mimeType) {
    return this.mediaType()
      .toLowerCase()
      .startsWith(mimeType.toLowerCase())
  }

  tinyProxy() {
    return (
      this.document.proxies &&
      (this.document.proxies ? this.document.proxies.tinyProxy : null)
    )
  }

  isContainedByParent() {
    const containerTypes = ['flipbook']

    return (
      (this.document.media &&
        this.document.media.clip &&
        this.document.media.clip.type &&
        containerTypes.includes(this.document.media.clip.type)) === true
    )
  }

  width() {
    return this.getMedia().width
  }

  height() {
    return this.getMedia().height
  }

  aspect() {
    return this.width() / Math.max(1, this.height())
  }

  getMedia() {
    return this.document.media || {}
  }

  getClip() {
    const media = this.getMedia()
    return media.clip || {}
  }

  proxyAspect() {
    const proxy = this.biggestProxy()
    if (proxy) return proxy.width / Math.max(1, proxy.height)
  }

  backgroundColor() {
    return this.tinyProxy() ? this.tinyProxy()[5] : getRandomColor()
  }

  pageCount() {
    if (this.document.media && this.document.media.pages)
      return this.document.media.pages
  }

  startPage() {
    return this.getClip().start
  }

  stopPage() {
    return this.getClip().stop
  }

  frameRate() {
    // frames per second
    return this.document.media && this.document.media.frameRate
  }
  frames() {
    // total # frames in the source video -- the entire film, not the clip
    return this.document.media && this.document.media.frames
  }
  frameRange() {
    // number of frames in this clip -- a subset of frames()
    return this.stopFrame() - this.startFrame()
  }
  duration() {
    // seconds in this clip -- a subset of the entire film
    this.frameRange() / (this.frameRate() || 30)
  }
  isClip() {
    return !!(this.document.media && this.document.media.clip)
  }
  startFrame() {
    // start frame for this clip -- >= 0
    if (this.isOfType('video')) {
      if (this.isClip()) {
        const time = new Timecode(this.document.media.frameRate)
        return time.timeToFrames(this.document.media.clip.start)
      }
      return 0
    }
  }
  stopFrame() {
    // stop frame for this clip -- <= frames()
    if (this.isOfType('video')) {
      if (this.isClip()) {
        const time = new Timecode(this.document.media.frameRate)
        return time.timeToFrames(this.document.media.clip.stop)
      }
      return this.document.media && this.document.media.frames - 1
    }
  }
  validVideo() {
    if (!this.frameRate()) return false
    if (!this.frames()) return false
    if (!this.frameRange()) return false
    return true
  }

  smallestProxy() {
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

  biggestProxy() {
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

  closestProxy(width, height) {
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

  parentId() {
    if (!this.document.media || !this.document.media.clip) return null
    return this.document.media.clip.parent
  }

  clipType() {
    if (
      this.document.media === undefined ||
      this.document.media.clip === undefined
    ) {
      return null
    }

    return this.document.media.clip.type
  }

  folders() {
    return (
      this.document &&
      this.document.zorroa &&
      this.document.zorroa.links &&
      this.document.zorroa.links.folder
    )
  }

  // Returns true if the asset is in any of the folder ids
  memberOfAnyFolderIds(folderIds) {
    const folders = this.folders()
    if (!folders || !folders.length) return false
    for (const folderId of folderIds) {
      const index = folders.findIndex(id => id === folderId)
      if (index >= 0) return true
    }
    return false
  }

  // Returns true if the asset is in all of the folder ids
  memberOfAllFolderIds(folderIds) {
    const folders = this.folders()
    if (!folders || !folders.length) return false
    for (const folderId of folderIds) {
      const index = folders.findIndex(id => id === folderId)
      if (index < 0) return false
    }
    return true
  }

  addFolderIds(folderIds) {
    const folders = this.folders()
    if (!folders || !folders.length) {
      if (!this.document.zorroa) this.document.zorroa = {}
      if (!this.document.zorroa.links) this.document.zorroa.links = {}
      this.document.zorroa.links.folder = [...folderIds]
    } else {
      const newFolderIds = new Set([...folderIds])
      folderIds.forEach(id => newFolderIds.add(id))
      this.document.zorroa.links.folder = [...newFolderIds]
    }
  }

  removeFolderIds(folderIds) {
    const folders = this.folders()
    if (folders && folders.length) {
      const newFolderIds = new Set([...folders])
      folderIds.forEach(id => newFolderIds.delete(id))
      this.document.zorroa.links.folder = [...newFolderIds]
    }
  }

  static lastNamespace(field) {
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

  findRawValue(fields) {
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
  value(field) {
    return Asset._valueToString(Asset._field(this.document, field))
  }

  // Return the value for a metadata field specified using dot-notation
  // as a path through the JSON-structured asset document. Recursively
  // invokes _field to navigate through the JSON and then uses
  // _valueToString to get a displayable form of the value.
  rawValue(field) {
    if (field === 'id' || field === 'score') return this[field]
    return Asset._field(this.document, field)
  }

  static _field(obj, key) {
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

  static _valueToString(value) {
    // E.g. tinyProxy, an array of POD
    // FIXME: Unify array management with _field
    if (Array.isArray(value) || value instanceof Array) {
      let array = '['
      value.map(f => {
        array += Asset._valueToString(f)
        array += ', '
      })
      array = array.slice(0, array.length - 2)
      array += ']'
      return array
    }

    assert.ok(
      !(value instanceof Object || typeof value === 'object'),
      'object field',
    )
    if (value instanceof String || typeof value === 'string') {
      return value
    }
    if (value instanceof Number || typeof value === 'number') {
      return value.toLocaleString()
    }
  }

  terms(field) {
    return Asset._terms(this.document, field)
  }

  static _terms(obj, key) {
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

function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function minimalUniqueFieldTitle(field, fields, minIndex) {
  const types = ['point', 'bit', 'byte', 'raw']
  const names = field.split('.')
  if (!names || names.length < 2) return { head: field }
  let title, head, tails
  for (let i = names.length - 1; i >= minIndex; --i) {
    if (i === names.length - 1 && types.findIndex(t => t === names[i]) >= 0)
      continue
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
    const matchesAnotherField =
      fields.findIndex(f => f !== field && f.endsWith(title)) >= 0
    if (!matchesAnotherField) return { head, tails }
  }
  return { head, tails }
}
