import { FacetWidgetInfo } from '../components/Racetrack/WidgetInfo'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'

export default class Widget {
  constructor ({id, type, sliver, isEnabled, isOpen}) {
    this.id = id || uniqueId()
    this.type = type
    this.sliver = sliver
    this.isEnabled = (isEnabled !== undefined) ? isEnabled : true
    this.isOpen = isOpen
  }

  rawField () {
    switch (this.type) {
      case FacetWidgetInfo.type: return this.sliver && this.sliver.aggs.facet.terms.field
    }
  }

  field () {
    const raw = this.rawField()
    if (raw) return raw.replace(/\.raw$/, '')
  }
}

export function aggField (field, fieldTypes) {
  field = field && field.replace(/\.raw/, '')
  if (!field || !field.length || !fieldTypes || !fieldTypes[field]) return
  const numericFieldTypes = new Set(['double', 'integer', 'long', 'date'])
  const isNumeric = numericFieldTypes.has(fieldTypes[field])
  return (isNumeric) ? field : field + '.raw'
}

export function createFacetWidget (field, assets, fieldTypes) {
  const type = FacetWidgetInfo.type
  const isOpen = true
  let terms = []
  if (assets) {
    for (let asset of assets) {
      const term = asset.terms(field)
      if (term instanceof Array) {
        terms.concat(term)
      } else {
        terms.push(term)
      }
    }
  }
  // FIXME: Implicitly using the layout of a Facet widget sliver.
  const rawField = aggField(field, fieldTypes)
  const aggs = { facet: { terms: { field: rawField, size: 100 } } }
  const filter = terms.length ? new AssetFilter({terms: {[rawField]: terms}}) : null
  const sliver = new AssetSearch({filter, aggs})
  return new Widget({type, sliver, isOpen})
}

// Acts like a static variable, returning increasing unique ids
var uniqueId = (function () {
  var id = 0                          // Private persistent value
  return function () { return ++id }  // Return and increment
})()                                  // Invoke to increment
