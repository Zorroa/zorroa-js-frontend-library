import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_VALUES } from '../constants/actionTypes'
import Widget, { createFacetWidget, createExistsWidget, createMapWidget,
  createDateRangeWidget, createRangeWidget,
  createFiletypeWidget, createColorWidget, createSortOrderWidget } from '../models/Widget'
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
  CollectionsWidgetInfo,
  SortOrderWidgetInfo
} from '../components/Racetrack/WidgetInfo'
import * as assert from 'assert'
import { selectFolderIds } from './folderAction'
import { similarAssets, orderAssets } from './assetsAction'

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
  if (similar && similar.values && similar.values.length > maxValues) {
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
export function restoreSearch (search, doNotRestoreSelectedFolders) {
  let widgets = []

  // Create a SimpleSearch if we have a query string
  if (search.query) {
    const sliver = new AssetSearch({ query: search.query, fuzzy: search.fuzzy })
    const simpleSearch = new Widget({ type: SimpleSearchWidgetInfo.type, sliver })
    widgets.push(simpleSearch)
  }

  // Restore widgets from aggs to restore widgets that have no active filter
  // using the master widget constructors for consistent agg definitions.
  // Note that Dynamic Hierarchies do not have aggs saved, like saved searches.
  const isEnabled = true
  const isPinned = false
  if (search.aggs) {
    Object.keys(search.aggs).forEach(id => {
      const agg = search.aggs[id]
      if (agg.aggs.facet) {
        const field = agg.aggs.facet.terms.field
        const fieldType = 'string'
        const order = { '_count': 'desc' }
        const terms = undefined
        const facet = createFacetWidget(field, fieldType, terms, order, isEnabled, isPinned)
        widgets.push(facet)
      } else if (agg.aggs.filetype) {
        const field = 'source.extension'
        const fieldType = 'string'
        const exts = undefined
        const filetype = createFiletypeWidget(field, fieldType, exts, isEnabled, isPinned)
        widgets.push(filetype)
      } else if (agg.aggs.map) {
        const field = agg.aggs.map.geohash_grid.field
        const map = createMapWidget(field, 'point', undefined, isEnabled, isPinned)
        widgets.push(map)
      } else if (agg.aggs.dateRange) {
        const field = agg.aggs.dateRange.stats.field
        const minStr = undefined
        const maxStr = undefined
        const dateRange = createDateRangeWidget(field, 'date', minStr, maxStr, isEnabled, isPinned)
        widgets.push(dateRange)
      } else if (agg.aggs.colors) {
        const vals = undefined
        const isServerHSL = true
        const colors = createColorWidget('colors', 'color', vals, isServerHSL, isEnabled, isPinned)
        widgets.push(colors)
      } else if (agg.aggs.sortOrder) {
        const field = undefined
        const fieldType = undefined
        const sortOrder = createSortOrderWidget(field, fieldType, isEnabled, isPinned)
        widgets.push(sortOrder)
      } else {
        Object.keys(agg.aggs).forEach(field => {
          const range = agg.aggs[field]
          if (range && range.stats && range.stats.field === field) {
            const min = undefined
            const max = undefined
            const range = createRangeWidget(field, 'double', min, max, isEnabled)
            widgets.push(range)
          }
        })
      }
    })
  }

  // Create a facet for each term.
  // FIXME: Maps create a term facet too!
  if (search.postFilter && search.postFilter.terms) {
    Object.keys(search.postFilter.terms).forEach(field => {
      const terms = search.postFilter.terms[field]
      if (terms && terms.length) {
        const facet = widgets.find(widget => (
          (widget.type === FacetWidgetInfo.type &&
          field === widget.sliver.aggs.facet.terms.field) ||
          (widget.type === FiletypeWidgetInfo.type &&
          field === widget.sliver.aggs.filetype.terms.field)
        ))
        if (facet) {
          facet.sliver.filter = new AssetFilter({terms: {[field]: terms}})
        } else {
          const order = { '_count': 'desc' }
          const w = createFacetWidget(field, 'string', terms, order, isEnabled, isPinned)
          widgets.push(w)
        }
      }
    })
  }

  // Create an exists widget for each "exists" & "missing" field
  if (search.filter && (search.filter.exists || search.filter.missing)) {
    var mkExistsWidget = (field, isMissing) => {
      const exists = widgets.find(widget => (
        widget.type === ExistsWidgetInfo.type &&
        field === widget.sliver.aggs.exists.stats.field
      ))
      if (exists) {
        exists.sliver.filter = new AssetFilter({[isMissing ? 'missing' : 'exists']: [field]})
      } else {
        const w = createExistsWidget(field, null, isMissing, isEnabled, isPinned)
        widgets.push(w)
      }
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
    for (let field in search.postFilter.range) {
      const range = widgets.find(widget => (
        widget.type === RangeWidgetInfo.type &&
        field === widget.sliver.aggs[field].stats.field
      ))
      if (range) {
        range.sliver.filter = new AssetFilter({ range: { [field]: search.postFilter.range[field] } })
      } else {
        const w = createRangeWidget(field, 'double', undefined, undefined, isEnabled, isPinned)
        widgets.push(w)
      }
    }
  }

  // Create a DateRange widget for each "range" field in the query
  // NOTE the date ranges are in filter instead of postFilter
  // that is the only differentiating factor right now
  // TODO: fix all this during the widget state refactor
  // when we store an explicit racetrack data block on the server
  if (search.filter && search.filter.range) {
    for (let field in search.filter.range) {
      const range = widgets.find(widget => (
        widget.type === DateRangeWidgetInfo.type &&
        field === widget.sliver.aggs.dateRange.stats.field
      ))
      if (range) {
        range.sliver.filter = new AssetFilter({range: {[field]: search.filter.range[field]}})
      } else {
        const w = createDateRangeWidget(field, 'date', undefined, undefined, isEnabled, isPinned)
        widgets.push(w)
      }
    }
  }

  // Create a color widget if there's a color query
  if (search.filter && search.filter.colors) {
    const colors = widgets.find(widget => (widget.type === ColorWidgetInfo.type))
    if (colors) {
      colors.sliver.filter = new AssetFilter({colors: search.filter.colors})
    } else {
      const w = createColorWidget('colors', 'color', search.filter.colors, true, isEnabled, isPinned)
      widgets.push(w)
    }
  }

  // Set the sort order
  if (search.order) {
    const order = widgets.find(widget => (widget.type === SortOrderWidgetInfo.type))
    if (order) {
      order.sliver = new AssetSearch({order: search.order})
    } else {
      const w = createSortOrderWidget(undefined, undefined, isEnabled, isPinned)  // use global ordering
      widgets.push(w)
    }
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
  const actions = [resetRacetrackWidgets(widgets)]
  if (!doNotRestoreSelectedFolders) actions.push(selectFolderIds(selectedFolderIds))

  // Set the global order to match the search
  if (search.order) {
    actions.push(orderAssets(search.order))
  }

  // Create a SimilarHash widget if there's a hash query
  if (search.filter && search.filter.hamming) {
    actions.push(similar({
      field: search.filter.hamming.field,
      values: search.filter.hamming.hashes,
      assetIds: search.filter.hamming.assetIds,
      weights: search.filter.hamming.weights
    }))
    const fields = [search.filter.hamming.field, 'image.width', 'image.height', 'video.width', 'video.height', 'proxies*']
    actions.push(similarAssets(search.filter.hamming.assetIds, fields))
  }

  // Reset the racetrack to the new widget
  return actions
}
