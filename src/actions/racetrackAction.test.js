import { modifyRacetrackWidget, removeRacetrackWidgetIds, resetRacetrackWidgets } from './racetrackAction'
import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS } from '../constants/actionTypes'
import Widget from '../models/Widget'
import AssetSearch from '../models/AssetSearch'
import { SimpleSearchWidgetInfo } from '../components/Racetrack/WidgetInfo'

describe('racetrackActions', () => {
  it('should modify widget', () => {
    const sliver = new AssetSearch({query: 'foo'})
    const widget = new Widget({ sliver, type: SimpleSearchWidgetInfo.type })
    const expectedAction = {
      type: MODIFY_RACETRACK_WIDGET,
      payload: widget
    }
    expect(modifyRacetrackWidget(widget)).toEqual(expectedAction)
  })

  it('should remove widget', () => {
    const id = 1
    const ids = [id]
    const expectedAction = {
      type: REMOVE_RACETRACK_WIDGET_IDS,
      payload: ids
    }
    expect(removeRacetrackWidgetIds([id])).toEqual(expectedAction)
  })

  it('should reset racetrack', () => {
    const sliver = new AssetSearch({query: 'foo'})
    const widget = new Widget({ sliver, type: SimpleSearchWidgetInfo.type })
    const widgets = [widget]
    const expectedAction = {
      type: RESET_RACETRACK_WIDGETS,
      payload: widgets
    }
    expect(resetRacetrackWidgets(widgets)).toEqual(expectedAction)
  })
})
