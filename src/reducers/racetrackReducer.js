import {
  MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_FIELD, SIMILAR_VALUES, ASSET_ORDER, ASSET_SORT, ASSET_FIELDS, UNAUTH_USER } from '../constants/actionTypes'
import Widget from '../models/Widget'
import * as assert from 'assert'

const initialState = {
  widgets: [],
  similarField: null,
  similarValues: []
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
    case SIMILAR_FIELD: {
      const similarField = action.payload
      return { ...state, similarField }
    }
    case SIMILAR_VALUES: {
      const similarValues = action.payload
      assert.ok(Array.isArray(similarValues))
      return { ...state, similarValues }
    }
    case ASSET_ORDER:
    case ASSET_SORT: {
      return { ...state, similarValues: [] }
    }
    case ASSET_FIELDS: {
      // Scan available asset fields for the preferred or a valid field
      let similarField = state.similarField || 'Similarity.TensorFlow.byte'
      let found = false
      const types = Object.keys(action.payload)
      for (let i = 0; !found && i < types.length; ++i) {
        const type = types[i]
        const fields = action.payload[type]
        for (let j = 0; !found && j < fields.length; ++j) {
          if (fields[j].toLowerCase() === similarField.toLowerCase()) {
            similarField = fields[j]  // In case toLowerCase masked the field
            found = true
          }
        }
      }
      if (!found) {
        similarField = null
      }
      if (!similarField) {
        const types = Object.keys(action.payload)
        for (let i = 0; !similarField && i < types.length; ++i) {
          const type = types[i]
          const fields = action.payload[type]
          for (let j = 0; !similarField && j < fields.length; ++j) {
            if (fields[j].toLowerCase().startsWith('similarity')) {
              similarField = fields[j]
            }
          }
        }
      }
      return { ...state, similarField }
    }
    case UNAUTH_USER:
      return initialState
  }

  return state
}
