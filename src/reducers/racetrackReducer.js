import {
  MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_VALUES, ASSET_ORDER, ASSET_SORT, ASSET_FIELDS, UNAUTH_USER } from '../constants/actionTypes'
import Widget from '../models/Widget'
import * as assert from 'assert'

const initialState = {
  widgets: [],
  similar: { field: null, values: [], ids: [] }
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
    case SIMILAR_VALUES: {
      const similar = { ...state.similar, ...action.payload }
      assert.ok(Array.isArray(similar.values))
      assert.ok(Array.isArray(similar.ids))
      assert.ok(similar.values.length === similar.ids.length)
      return { ...state, similar }
    }
    case ASSET_ORDER:
    case ASSET_SORT: {
      return { ...state, similar: { ...state.similar, values: [], ids: [] } }
    }
    case ASSET_FIELDS: {
      // Scan available asset fields for the preferred or a valid field
      let field = state.similar.field || 'Similarity.TensorFlow.byte'
      let found = false
      const types = Object.keys(action.payload)
      for (let i = 0; !found && i < types.length; ++i) {
        const type = types[i]
        const fields = action.payload[type]
        for (let j = 0; !found && j < fields.length; ++j) {
          if (fields[j].toLowerCase() === field.toLowerCase()) {
            field = fields[j]  // In case toLowerCase masked the field
            found = true
          }
        }
      }
      if (!found) {
        field = null
      }
      if (!field) {
        const types = Object.keys(action.payload)
        for (let i = 0; !field && i < types.length; ++i) {
          const type = types[i]
          const fields = action.payload[type]
          for (let j = 0; !field && j < fields.length; ++j) {
            if (fields[j].toLowerCase().startsWith('similarity')) {
              field = fields[j]
            }
          }
        }
      }
      return { ...state, similar: { ...state.similar, field } }
    }

    case UNAUTH_USER:
      return initialState
  }

  return state
}
