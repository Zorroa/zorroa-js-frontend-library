import racetrackReducer from './racetrackReducer'
import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS } from '../constants/actionTypes'
import { SimpleSearchWidgetInfo } from '../components/Racetrack/WidgetInfo'
import Widget from '../models/Widget'
import AssetSearch from '../models/AssetSearch'

describe('racetrackReducer', () => {
  it('MODIFY_RACETRACK_WIDGET returns modified widget', () => {
    const sliver = new AssetSearch({ query: 'foo' })
    const widget = new Widget({ sliver, type: SimpleSearchWidgetInfo.type })
    const initialState = { widgets: [] }
    const result = { widgets: [widget] }
    expect(racetrackReducer(initialState, { type: MODIFY_RACETRACK_WIDGET, payload: widget }))
      .toEqual(result)
  })

  it('REMOVE_RACETRACK_WIDGET_IDS returns empty widgets', () => {
    const sliver = new AssetSearch({ query: 'foo' })
    const widget = new Widget({ sliver, type: SimpleSearchWidgetInfo.type })
    const initialState = { widgets: [widget] }
    expect(racetrackReducer(initialState, { type: REMOVE_RACETRACK_WIDGET_IDS, payload: [widget.id] }))
      .toEqual({ widgets: [] })
  })

  it('REMOVE_RACETRACK_WIDGET_IDS returns smaller widgets', () => {
    const sliver1 = new AssetSearch({ query: 'foo' })
    const sliver2 = new AssetSearch({ query: 'bar' })
    const widget1 = new Widget({ sliver: sliver1, type: SimpleSearchWidgetInfo.type })
    const widget2 = new Widget({ sliver: sliver2, type: SimpleSearchWidgetInfo.type })
    const initialState = { widgets: [ widget1, widget2 ] }
    const result = { widgets: [widget2] }
    expect(racetrackReducer(initialState, { type: REMOVE_RACETRACK_WIDGET_IDS, payload: [widget1.id] }))
      .toEqual(result)
  })

  it('RESET_RACETRACK_WIDGETS to replace initial state', () => {
    const sliver1 = new AssetSearch({ query: 'foo' })
    const sliver2 = new AssetSearch({ query: 'bar' })
    const sliver3 = new AssetSearch({ query: 'bam' })
    const widget1 = new Widget({ sliver: sliver1, type: SimpleSearchWidgetInfo.type })
    const widget2 = new Widget({ sliver: sliver2, type: SimpleSearchWidgetInfo.type })
    const widget3 = new Widget({ sliver: sliver3, type: SimpleSearchWidgetInfo.type })
    const initialState = { widgets: [ widget1, widget2 ] }
    const payload = [widget3]
    const result = { widgets: payload }
    expect(racetrackReducer(initialState, { type: RESET_RACETRACK_WIDGETS, payload }))
      .toEqual(result)
  })

  it('RESET_RACETRACK_WIDGETS with undefined returns object', () => {
    const sliver1 = new AssetSearch({ query: 'foo' })
    const sliver2 = new AssetSearch({ query: 'bar' })
    const widget1 = new Widget({ sliver: sliver1, type: SimpleSearchWidgetInfo.type })
    const widget2 = new Widget({ sliver: sliver2, type: SimpleSearchWidgetInfo.type })
    const initialState = { widgets: [ widget1, widget2 ] }
    const result = { widgets: [] }
    expect(racetrackReducer(initialState, { type: RESET_RACETRACK_WIDGETS, undefined }))
      .toEqual(result)
  })
})
