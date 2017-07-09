import { SimpleSearchWidgetInfo, ExistsWidgetInfo, FacetWidgetInfo,
  MapWidgetInfo, DateRangeWidgetInfo, RangeWidgetInfo, SimilarHashWidgetInfo,
  FiletypeWidgetInfo, ColorWidgetInfo, CollectionsWidgetInfo, SortOrderWidgetInfo
} from '../components/Racetrack/WidgetInfo'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
import { HSL2HSV } from '../services/color'

export default class Widget {

  // Return increasing unique ids for newly created widgets
  static guid(id) {
    // Handle the case where we load widgets from a folder with a larger id
    if (id && (!Widget._guid || id > Widget._guid)) Widget._guid = id + 1
    if (!Widget._guid) Widget._guid = 0 // First time
    return ++Widget._guid
  }

  constructor ({id, type, sliver, isEnabled, isPinned}) {
    this.id = Widget.guid(id)
    this.type = type
    this.sliver = sliver
    this.isEnabled = (isEnabled !== undefined) ? isEnabled : true
    this.isPinned = (isPinned !== undefined) ? isPinned : false
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

  mergable (rhs) {
    return this.type === rhs.type && this.field() === rhs.field()
  }

  merge (rhs) {
    if (!this.mergable(rhs)) return false
    this.sliver = this.sliver.merge(rhs.sliver)
    this.isEnabled |= rhs.isEnabled
    this.isPinned |= rhs.isPinned
    // FIXME: No attrs merging!
    return true
  }
}

export function aggField (field, fieldType) {
  field = field && field.replace(/\.raw/, '')
  if (!field || !field.length || !fieldType || !fieldType.length) return
  const numericFieldTypes = new Set(['double', 'integer', 'long', 'date', 'boolean'])
  const isNumeric = numericFieldTypes.has(fieldType)
  return (isNumeric) ? field : field + '.raw'
}

export function widgetTypeForField (field, type) {
  const parents = field.split('.')
  if (type === 'string' && parents[0].toLowerCase() === 'similarity' && parents.length === 3) {
    return SimilarHashWidgetInfo.type
  }
  if (type === 'nested' && parents[0] === 'colors' && parents.length === 1) {
    return ColorWidgetInfo.type
  }
  if (type === 'string' && parents[0] === 'source' && parents.length === 2 && parents[1] === 'extension') {
    return FiletypeWidgetInfo.type
  }
  switch (type) {
    case 'date': return DateRangeWidgetInfo.type
    case 'point': return MapWidgetInfo.type
    case 'boolean':
    case 'string': return FacetWidgetInfo.type
    case 'integer':
    case 'double':
    case 'long':
      return RangeWidgetInfo.type
  }
}

export function createSearchWidget (field, fieldType, queryString, fuzzy, isEnabled, isPinned) {
  const type = SimpleSearchWidgetInfo.type
  const sliver = new AssetSearch({query: queryString, fuzzy})
  if (field.length) {
    sliver.queryFields = { [field]: 1 }
  }
  return new Widget({type, sliver, isEnabled, isPinned})
}

export function createExistsWidget (field, fieldType, isMissing, isEnabled, isPinned) {
  const type = ExistsWidgetInfo.type
  const sliver = new AssetSearch()
  if (field) {
    const key = (isMissing) ? 'missing' : 'exists'
    sliver.filter = new AssetFilter({ [key]: [ field ] })
  }
  return new Widget({ type, sliver, isEnabled, isPinned })
}

export function createFacetWidget (field, fieldType, terms, order, isEnabled, isPinned) {
  const type = FacetWidgetInfo.type
  const rawField = aggField(field, fieldType)
  const aggs = { facet: { terms: { field: rawField, order, size: 1000 } } }
  const filter = terms && terms.length ? new AssetFilter({terms: {[rawField]: terms}}) : null
  const sliver = new AssetSearch({filter, aggs})
  return new Widget({type, sliver, isEnabled, isPinned})
}

export function createMapWidget (field, fieldType, term, isEnabled, isPinned) {
  const type = MapWidgetInfo.type
  const aggs = { map: { geohash_grid: { field, precision: 7 } } }
  let sliver = new AssetSearch({aggs})
  if (term && term.length) {
    const terms = {[field + '.raw']: [term]}
    const bounds = { [field + '.raw']: {top_left: 'hash', bottom_right: 'hash'} }
    sliver.filter = new AssetFilter({terms, geo_bounding_box: bounds})
    // Add this.bounds and set agg precision
  }
  return new Widget({type, sliver, isEnabled, isPinned})
}

export function createDateRangeWidget (field, fieldType, minStr, maxStr, isEnabled, isPinned) {
  const type = DateRangeWidgetInfo.type
  const aggs = { dateRange: { stats: { field } } }     // Just for restore, refactor for Folder data
  let sliver = new AssetSearch({ aggs })
  if (field && minStr !== undefined && minStr !== null && maxStr !== undefined && maxStr !== null) {
    const range = { [field]: { 'gte': minStr, 'lte': maxStr } }
    sliver.filter = new AssetFilter({ range })
  }
  return new Widget({ type, sliver, isEnabled, isPinned })
}

export function createRangeWidget (field, fieldType, min, max, isEnabled, isPinned) {
  const type = RangeWidgetInfo.type
  // let's auto-range this puppy
  const aggs = { [field]: { stats: { field } } }
  let sliver = new AssetSearch({ aggs })
  // assert.ok(min !== null && max !== null)
  if (field && min !== undefined && max !== undefined && min !== null && max !== null && min !== Number.MAX_SAFE_INTEGER && max !== -Number.MAX_SAFE_INTEGER) {
    const range = { [field]: { 'gte': min, 'lte': max } }
    sliver.filter = new AssetFilter({ range })
  }
  return new Widget({ type, sliver, isEnabled, isPinned })
}

export function createSimilarityWidget (field, fieldType, isEnabled, isPinned) {
  const type = SimilarHashWidgetInfo.type
  return new Widget({type, isEnabled, isPinned})
}

export function createFiletypeWidget (field, fieldType, exts, isEnabled, isPinned) {
  if (!field || !field.length) field = 'source.extension'
  const type = FiletypeWidgetInfo.type
  const order = { '_term': 'asc' }
  const aggs = { filetype: { terms: { field, order, size: 100 } } }
  let sliver = new AssetSearch({aggs})
  if (exts && exts.length) {
    sliver.filter = new AssetFilter({terms: {[field]: exts}})
  }
  return new Widget({type, sliver, isEnabled, isPinned})
}

export function createColorWidget (field, fieldType, colors, isServerHSL, isEnabled, isPinned) {
  const type = ColorWidgetInfo.type
  const aggs = { colors: { stats: { field: 'source.fileSize' } } }     // Just for restore, refactor for Folder data
  const sliver = new AssetSearch({ aggs })
  const RATIO_MAX_FACTOR = 1.5  // maxRatio in query is this factor times user ratio
  const RATIO_MIN_FACTOR = 0.25 // minRatio in query is this factor times user ratio

  if (colors && colors.length) {
    sliver.filter = new AssetFilter({colors: {colors: colors.map(color => {
      const hsv = (isServerHSL) ? color.hsl : HSL2HSV(color.hsl) // see toggleServerHSL

      return {
        hue: Math.floor(hsv[0]),
        saturation: Math.floor(hsv[1]),
        brightness: Math.floor(hsv[2]),

        hueRange: 24,
        saturationRange: 75, // we have no saturation control, so allow a wide variety
        brightnessRange: 25,

        ratio: color.ratio, // [0..1] range
        minRatio: color.ratio * RATIO_MIN_FACTOR * 100, // [0..100] range
        maxRatio: color.ratio * RATIO_MAX_FACTOR * 100,  // [0..100] range

        key: color.key
      }
    })}})
  }

  return new Widget({type, sliver, isEnabled, isPinned})
}

// Bare ctor used by AddWidget, values come directly from app state
export function createCollectionsWidget (field, fieldType, isEnabled, isPinned) {
  field = 'source.filename'
  const aggs = { collections: { stats: { field: 'source.fileSize' } } }     // Just for restore, refactor for Folder data
  const sliver = new AssetSearch({aggs})
  return new Widget({type: CollectionsWidgetInfo.type, sliver, isEnabled, isPinned})
}

// Bare ctor used by AddWidget, values come directly from app state
export function createSortOrderWidget (field, filedType, isEnabled, isPinned) {
  field = 'source.filename'
  const aggs = { sortOrder: { stats: { field: 'source.fileSize' } } }     // Just for restore, refactor for Folder data
  const sliver = new AssetSearch({aggs})
  return new Widget({type: SortOrderWidgetInfo.type, sliver, isEnabled, isPinned})
}

export function fieldUsedInWidget (field, widget) {
  switch (widget.type) {
    case FacetWidgetInfo.type:
      if (widget.sliver &&
        (widget.sliver.aggs.facet.terms.field === field ||
        widget.sliver.aggs.facet.terms.field === `${field}.raw`)) return true
      break
    case MapWidgetInfo.type:
      if (widget.sliver && widget.sliver.aggs &&
        widget.sliver.aggs.map.geohash_grid.field === field) return true
      break
    case FiletypeWidgetInfo.type:
      if (field === 'source.extension') return true
      break
    case ColorWidgetInfo.type:
      if (field === 'colors') return true
      break
    case DateRangeWidgetInfo.type:
      if (widget.sliver && widget.sliver.filter && widget.sliver.filter.range &&
        Object.keys(widget.sliver.filter.range)[0] === field) return true
      break
    case SimilarHashWidgetInfo.type:
      if (widget.sliver && widget.sliver.filter && widget.sliver.filter.hamming &&
        widget.sliver.filter.hamming.field === field) return true
      break
    case RangeWidgetInfo.type:
      if (widget.sliver && widget.sliver.filter && widget.sliver.filter.range &&
        Object.keys(widget.sliver.filter.range)[0] === field) return true
      break
  }
  return false
}
