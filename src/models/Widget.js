import { FacetWidgetInfo } from '../components/Racetrack/WidgetInfo'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'

export default class Widget {
  constructor ({id, type, sliver, isOpen}) {
    this.id = id || uniqueId()
    this.type = type
    this.sliver = sliver
    this.isOpen = isOpen
  }
}

export function createFacetWidget (field, assets) {
  const type = FacetWidgetInfo.type
  const isOpen = true
  let terms = []
  for (let asset of assets) {
    const term = asset.term(field)
    if (term instanceof Array) {
      terms.concat(term)
    } else {
      terms.push(term)
    }
  }
  // FIXME: Implicitly using the layout of a Facet widget sliver.
  const rawField = field.endsWith('.raw') ? field : field + '.raw'
  const aggs = { facet: { terms: { field: rawField, size: 100 } } }
  const filter = new AssetFilter({terms: {[rawField]: terms}})
  const sliver = new AssetSearch({filter, aggs})
  return new Widget({type, sliver, isOpen})
}

// Acts like a static variable, returning increasing unique ids
var uniqueId = (function () {
  var id = 0                          // Private persistent value
  return function () { return ++id }  // Return and increment
})()                                  // Invoke to increment
