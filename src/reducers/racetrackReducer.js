import { MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS } from '../constants/actionTypes'
import Widget from '../models/Widget'
import * as assert from 'assert'

const initialState = {
  widgets: [],
  isOpen: true
}

export default function (state = initialState, action) {
  switch (action.type) {
    case MODIFY_RACETRACK_WIDGET: {
      const widget = action.payload
      assert.ok(widget instanceof Widget)
      const index = state.widgets.findIndex(w => w.id === widget.id)
      if (index < 0) {
        return { ...state, widgets: [...state.widgets, widget] }
      }
      let widgets = [ ...state.widgets ]
      widgets[index] = widget
      return { ...state, widgets }
    }
    case REMOVE_RACETRACK_WIDGET_IDS: {
      assert.ok(Array.isArray(action.payload))
      const ids = action.payload
      let widgets = [ ...state.widgets ]
      assert.ok(!widgets.length || widgets[0] instanceof Widget)
      widgets = state.widgets.filter(w => ids.indexOf(w.id) < 0)
      return { ...state, widgets }
    }
    case RESET_RACETRACK_WIDGETS: {
      const widgets = action.payload ? action.payload : []
      assert.ok(Array.isArray(widgets))
      assert.ok(!widgets.length || widgets[0] instanceof Widget)
      return { ...state, widgets }
    }
  }

  return state
}
