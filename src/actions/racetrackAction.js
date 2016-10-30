import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS } from '../constants/actionTypes'
import Widget from '../models/Widget'
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
