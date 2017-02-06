import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS } from '../constants/actionTypes'
import Widget from '../models/Widget'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
import {
  SimpleSearchWidgetInfo,
  FacetWidgetInfo,
  ColorWidgetInfo,
  ExistsWidgetInfo,
  RangeWidgetInfo,
  FiletypeWidgetInfo
} from '../components/Racetrack/WidgetInfo'
import * as assert from 'assert'

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

// Reconstruct Racetrack widgets from a search.
// Currently only supports SimpleSearch and Facet.
export function restoreSearch (search) {
  let widgets = []

  // Create a SimpleSearch if we have a query string
  if (search.query) {
    const sliver = new AssetSearch({ query: search.query })
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
  if (search.filter && search.filter.range) {
    const type = RangeWidgetInfo.type
    for (var field in search.filter.range) {
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

  // Reset the racetrack to the new widget
  return resetRacetrackWidgets(widgets)
}
