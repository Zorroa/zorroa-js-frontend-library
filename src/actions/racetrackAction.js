import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_VALUES } from '../constants/actionTypes'
import Widget, { createFacetWidget, createExistsWidget, createMapWidget,
  createDateRangeWidget, createRangeWidget, createCollectionsWidget,
  createFiletypeWidget, createColorWidget, createSortOrderWidget } from '../models/Widget'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
import { SimpleSearchWidgetInfo } from '../components/Racetrack/WidgetInfo'
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
    assert.ok(similar.ofsIds.length === similar.values.length)
    assert.ok(similar.weights.length === similar.values.length)
    similar.values = similar.values.slice(0, maxValues)
    similar.ofsIds = similar.ofsIds.slice(0, maxValues)
    similar.weights = similar.weights.slice(0, maxValues)
  }
  return ({
    type: SIMILAR_VALUES,
    payload: similar
  })
}

// Extract similar values from search
function extractSimilar (search) {
  if (search.filter && search.filter.hamming) {
    return ({
      field: search.filter.hamming.field,
      values: search.filter.hamming.hashes,
      ofsIds: search.filter.hamming.assetIds,
      weights: search.filter.hamming.weights,
      minScore: search.filter.hamming.minScore
    })
  }
}

// Merge widgets from multiple folders and restore search and related state
export function restoreFolders (folders) {
  if (!folders || !folders.length) return

  let mergedSimilar, order
  const widgets = []
  const search = new AssetSearch()
  let missingWidgets = false
  const searchFolderIds = []
  for (let i = 0; i < folders.length; ++i) {
    const folder = folders[i]
    if (folder.search) {
      search.merge(folder.search)
      searchFolderIds.push(folder.id)
    }
    if (!folder.attrs) {
      missingWidgets = true
      continue
    }
    const attrs = folder.attrs
    if (mergedSimilar && attrs.similar) {
      // Duplicated code from AssetFilter.merge()
      for (let key in attrs.similar) {
        if (key === 'field') continue   // FIXME: breaks for mixed similarity fields!
        if (key in attrs.similar) {
          if (key in mergedSimilar) {
            const union = (arr) => ([ ...new Set([].concat(...arr)) ])
            mergedSimilar[key] = union([mergedSimilar[key], attrs.similar[key]])
          } else {
            mergedSimilar[key] = [ ...attrs.similar[key] ]
          }
        }
      }
    } else if (!mergedSimilar) {
      mergedSimilar = attrs.similar
    }
    if (!order) order = folder.attrs && folder.attrs.order
    if (!folder.attrs || !folder.attrs.widgets) {
      missingWidgets = true
      continue
    }
    for (let j = 0; j < folder.attrs.widgets.length; ++j) {
      const widget = new Widget(folder.attrs.widgets[j])
      let merged = false
      for (let k = 0; k < widgets.length; ++k) {
        const src = widgets[k]
        if (src.merge(widget)) {
          merged = true
          break
        }
      }
      if (!merged) widgets.push(widget)
    }
  }

  // Backwards compatibility -- a folder is missing widgets.
  // Restore implicitly from search, but do not re-select folders.
  if (missingWidgets) return restoreSearch(search)

  // Do not restore selected folders to avoid infinite recursion
  const selectedFolderIds = restoreWidgetSlivers(widgets, search)
  return restoreActions(widgets, search, selectedFolderIds, mergedSimilar)
}

// Reconstruct Racetrack widgets from a search.
function restoreSearch (search) {
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

  const mergedSimilar = extractSimilar(search)
  const selectedFolderIds = restoreWidgetSlivers(widgets, search)
  return restoreActions(widgets, search, selectedFolderIds, mergedSimilar)
}

// Helper function to extract widget slivers from the search,
// after constructing the widget list either explicitly from attrs
// or implicitly from the search, creating additional widgets
// as needed for "unclaimed" slivers.
function restoreWidgetSlivers (widgets, search) {
  const isEnabled = true
  const isPinned = false

  const findWidget = (field) => widgets.find(widget => (widget.field === field))

  // Create a facet for each term.
  // FIXME: Maps create a term facet too!
  const addFacets = (filter) => {
    if (!filter || !filter.terms) return
    Object.keys(filter.terms).forEach(field => {
      const terms = filter.terms[field]
      if (terms && terms.length) {
        const facet = findWidget(field)
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
  addFacets(search.filter)
  addFacets(search.postFilter)

  // Create an exists widget for each "exists" & "missing" field
  const mkExistsWidget = (field, isMissing) => {
    const exists = findWidget(field)
    if (exists) {
      exists.sliver.filter = new AssetFilter({[isMissing ? 'missing' : 'exists']: [field]})
    } else {
      const w = createExistsWidget(field, null, isMissing, isEnabled, isPinned)
      widgets.push(w)
    }
  }
  const addExists = (filter) => {
    if (!filter) return
    if (filter.exists) {
      filter.exists.forEach(field => mkExistsWidget(field, false))
    }
    if (filter.missing) {
      filter.missing.forEach(field => mkExistsWidget(field, true))
    }
  }
  addExists(search.filter)
  addExists(search.postFilter)

  // Create a range widget for each "range" field in the query
  const addRanges = (filter) => {
    if (!filter || !filter.range) return
    for (let field in filter.range) {
      const range = findWidget(field)
      const sliver = new AssetSearch({ filter: new AssetFilter({ range: { [field]: filter.range[field] } }) })
      if (range) {
        range.sliver = sliver
      } else {
        const isDateField = field.toLowerCase().includes('date')  // FIXME: Check field type
        const w = isDateField ? createDateRangeWidget(field, 'date', undefined, undefined, isEnabled, isPinned)
          : createRangeWidget(field, 'double', undefined, undefined, isEnabled, isPinned)
        w.sliver = sliver
        widgets.push(w)
      }
    }
  }
  addRanges(search.filter)
  addRanges(search.postFilter)

  // Create a color widget if there's a color query
  // FIXME: Should look in postFilter for completeness?
  if (search.filter && search.filter.colors) {
    const colors = findWidget('colors')
    if (colors) {
      colors.sliver.filter = new AssetFilter({colors: search.filter.colors})
    } else {
      const w = createColorWidget('colors', 'color', search.filter.colors, true, isEnabled, isPinned)
      widgets.push(w)
    }
  }

  // Set the sort order
  if (search.order) {
    const order = findWidget('_order')
    if (order) {
      order.sliver = new AssetSearch({order: search.order})
    } else {
      const w = createSortOrderWidget('_order', undefined, isEnabled, isPinned)  // use global ordering
      widgets.push(w)
    }
  }

  // Select the folders specified in the search
  // FIXME: Should look in postFilter for completeness?
  let selectedFolderIds
  if (search.filter && search.filter.links && search.filter.links.folder && search.filter.links.folder.length) {
    const collections = findWidget('_collections')
    if (!collections) {
      selectedFolderIds = new Set([...search.filter.links.folder])
      const w = createCollectionsWidget('_collections', undefined, isEnabled, isPinned)
      widgets.push(w)
    }
  }

  return selectedFolderIds
}

// Helper function to return an array of actions needed to restore
// app state to match the widgets, search, and selected folders.
function restoreActions (widgets, search, selectedFolderIds, mergedSimilar) {
  // Return actions to update the racetrack for the new search
  const actions = [resetRacetrackWidgets(widgets)]
  actions.push(selectFolderIds(selectedFolderIds))

  // Set the global order to match the search
  if (search.order) {
    actions.push(orderAssets(search.order))
  }

  if (similar) {
    actions.push(similar(mergedSimilar))
  }

  // Reset the racetrack to the new widget
  return actions
}
