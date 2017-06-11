import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_VALUES } from '../constants/actionTypes'
import Widget from '../models/Widget'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
import {
  SimpleSearchWidgetInfo,
  FacetWidgetInfo,
  ColorWidgetInfo,
  ExistsWidgetInfo,
  RangeWidgetInfo,
  DateRangeWidgetInfo,
  FiletypeWidgetInfo,
  CollectionsWidgetInfo
} from '../components/Racetrack/WidgetInfo'
import * as assert from 'assert'
import { selectFolderIds } from './folderAction'

export function modifyRacetrackWidget (widget) {
  assert.ok(widget instanceof Widget)
  return ({
    type: MODIFY_RACETRACK_WIDGET,
    payload: widget
  })
}

export function removeRacetrackWidgetIds (ids) {
  return ({
    type: REMOVE_RACETRACK_WIDGET_IDS,
    payload: ids
  })
}

export function resetRacetrackWidgets (widgets) {
  return ({
    type: RESET_RACETRACK_WIDGETS,
    payload: widgets
  })
}

export function similar (similar) {
  const maxValues = 10
  if (similar.values.length > maxValues) {
    assert.ok(similar.assetIds.length === similar.values.length)
    assert.ok(similar.weights.length === similar.values.length)
    similar.values = similar.values.slice(0, maxValues)
    similar.assetIds = similar.assetIds.slice(0, maxValues)
    similar.weights = similar.weights.slice(0, maxValues)
  }
  return ({
    type: SIMILAR_VALUES,
    payload: similar
  })
}

// Reconstruct Racetrack widgets from a search.
export function restoreSearch (search) {
  let widgets = []

  // Create a SimpleSearch if we have a query string
  if (search.query) {
    const sliver = new AssetSearch({ query: search.query, fuzzy: search.fuzzy })
    const simpleSearch = new Widget({ type: SimpleSearchWidgetInfo.type, sliver })
    widgets.push(simpleSearch)
  }

  // Create a facet for each term.
  // FIXME: Maps create a term facet too!
  if (search.postFilter && search.postFilter.terms) {
    Object.keys(search.postFilter.terms).forEach(field => {
      const type = field === 'source.extension' ? FiletypeWidgetInfo.type : FacetWidgetInfo.type
      const terms = search.postFilter.terms[field]
      const agg = type === FiletypeWidgetInfo.type ? 'filetype' : 'facet'
      const aggs = { [agg]: { terms: {field, size: 100} } }
      let sliver = new AssetSearch({aggs})
      if (terms && terms.length) {
        sliver.filter = new AssetFilter({terms: {[field]: terms}})
      }
      const facet = new Widget({type, sliver})
      widgets.push(facet)
    })
  }

  // Create an exists widget for each "exists" & "missing" field
  if (search.filter && (search.filter.exists || search.filter.missing)) {
    const type = ExistsWidgetInfo.type
    var mkExistsWidget = (field, isMissing) => {
      let sliver = new AssetSearch()
      sliver.filter = new AssetFilter({[isMissing ? 'missing' : 'exists']: [field]})
      const existsWidget = new Widget({type, sliver})
      widgets.push(existsWidget)
    }
    if (search.filter.exists) {
      search.filter.exists.forEach(field => mkExistsWidget(field, false))
    }
    if (search.filter.missing) {
      search.filter.missing.forEach(field => mkExistsWidget(field, true))
    }
  }

  // Create a range widget for each "range" field in the query
  // NOTE the date ranges are in filter instead of postFilter
  // that is the only differentiating factor right now
  // TODO: fix all this during the widget state refactor
  // when we store an explicit racetrack data block on the server
  if (search.postFilter && search.postFilter.range) {
    const type = RangeWidgetInfo.type
    for (let field in search.postFilter.range) {
      let sliver = new AssetSearch()
      sliver.filter = new AssetFilter({ range: { [field]: search.postFilter.range[field] } })
      const rangeWidget = new Widget({type, sliver})
      widgets.push(rangeWidget)
    }
  }

  // Create a DateRange widget for each "range" field in the query
  // NOTE the date ranges are in filter instead of postFilter
  // that is the only differentiating factor right now
  // TODO: fix all this during the widget state refactor
  // when we store an explicit racetrack data block on the server
  if (search.filter && search.filter.range) {
    const type = DateRangeWidgetInfo.type
    for (let field in search.filter.range) {
      let sliver = new AssetSearch()
      sliver.filter = new AssetFilter({ range: { [field]: search.filter.range[field] } })
      const rangeWidget = new Widget({type, sliver})
      widgets.push(rangeWidget)
    }
  }

  // Create a color widget if there's a color query
  if (search.filter && search.filter.colors) {
    const type = ColorWidgetInfo.type
    let sliver = new AssetSearch()
    sliver.filter = new AssetFilter({colors: search.filter.colors})
    const color = new Widget({type, sliver})
    widgets.push(color)
  }

  // Select the folders specified in the search
  let selectedFolderIds
  if (search.filter && search.filter.links && search.filter.links.folder) {
    const type = CollectionsWidgetInfo.type
    selectedFolderIds = new Set([...search.filter.links.folder])
    let sliver = new AssetSearch()
    const collections = new Widget({type, sliver})
    widgets.push(collections)
  }

  // Return actions to update the racetrack for the new search
  const actions = [resetRacetrackWidgets(widgets), selectFolderIds(selectedFolderIds)]

  // Create a SimilarHash widget if there's a hash query
  if (search.filter && search.filter.hamming) {
    actions.push(similar({
      field: search.filter.hamming.field,
      values: search.filter.hamming.hashes,
      assetIds: search.filter.hamming.assetIds
    }))
  }

  // Reset the racetrack to the new widget
  return actions
}
