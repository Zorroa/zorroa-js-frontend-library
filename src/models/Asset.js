import * as assert from 'assert'

import Proxy from './Proxy'

// [dhart 01/11/17] REMOVE ASAP
// This is a demo day hack
export const Clips = {
  'other guys, the': '4fee274f-15b3-5751-b0cb-ad9b63304c41',
  'the other guys': '4fee274f-15b3-5751-b0cb-ad9b63304c41',
  '22 jump street': '8305906a-1a68-5f07-a22d-3250ca314b0c',
  'talladega nights': '9de7d881-963f-5156-987e-8dd4c4eadb8f',
  'talladega nights: the ballad of ricky bobby (ur)': '9de7d881-963f-5156-987e-8dd4c4eadb8f'
}

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
    let id = this.id

    // [dhart 2017-01-11] REMOVE ASAP
    // temporarily, for SPE, video clips can be represented by a sub-clip of another asset
    // The asset id is hardcoded for a demo, this needs to be removed asap
    // The sub-clip start and end time codes are inside the metadata spe.clip
    // spe is going to be renamed to something that is not client specific
    try { // this will bail out if anything goes wrong accessing spe
      id = Clips[this.document.spe.Film.Title[0].toLowerCase()]
    } catch (e) { /* absorb & ignore these errors */ }

    return `${protocol}//${host}:8066/api/v1/assets/${id}/_stream`
  }
  mediaType () { return this.document.source.mediaType }
  tinyProxy () { return this.document.proxies ? this.document.proxies.tinyProxy : null }

  width () { return this.document.image && this.document.image.width ? this.document.image.width : 0 }
  height () { return this.document.image && this.document.image.height ? this.document.image.height : 0 }

  aspect () { return this.width() / Math.max(1, this.height()) }

  backgroundColor () { return this.tinyProxy() ? this.tinyProxy()[5] : getRandomColor() }

  biggestProxy () {
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
