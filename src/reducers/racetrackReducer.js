import {
  MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_VALUES, ASSET_ORDER, ASSET_SORT, ASSET_FIELDS, SELECT_FOLDERS, UNAUTH_USER } from '../constants/actionTypes'
import Widget from '../models/Widget'
import { SimilarHashWidgetInfo, CollectionsWidgetInfo, SortOrderWidgetInfo } from '../components/Racetrack/WidgetInfo'
import * as assert from 'assert'

const initialState = {
  widgets: [],
  similar: { field: null, values: [], assetIds: [] }
}

function extractSimilar (similar, widget) {
  assert.ok(widget.type === SimilarHashWidgetInfo.type)
  const hamming = widget && widget.sliver && widget.sliver.filter && widget.sliver.filter.hamming
  if (!hamming) return similar
  if (!hamming.hashes || !hamming.hashes.length) widget.sliver.filter = null  // Remove invalid empty filter
  const field = hamming.field && hamming.field.endsWith('.raw') ? hamming.field.slice(0, -4) : hamming.field
  if (!field || field === similar.field) return similar
  return { ...similar, field }
}

function fieldExists(field, fieldTypes) {
  const types = Object.keys(fieldTypes)
  for (let i = 0; i < types.length; ++i) {
    const type = types[i]
    const fields = fieldTypes[type]
    for (let j = 0; j < fields.length; ++j) {
      if (fields[j] === field) return true
    }
  }
  return false
}

function bestSimilarityField (curField, fieldTypes) {
  if (curField && fieldExists(curField, fieldTypes)) return curField
  const defaultFields = [
    'similarity.mxnet.byte',
    'similarity.tensorflow.byte',
    'similarity.Tensorflow.byte',
    'similarity.TensorFlow.byte',
    'Similarity.Tensorflow.byte',
    'Similarity.TensorFlow.byte',
    'Similarity.tensorflow.byte',
    'similarity.hsv.byte'
  ]
  for (let i = 0; i < defaultFields.length; ++i) {
    if (fieldExists(defaultFields[i], fieldTypes)) return defaultFields[i]
  }
  const types = Object.keys(fieldTypes)
  for (let i = 0; i < types.length; ++i) {
    const type = types[i]
    const fields = fieldTypes[type]
    for (let j = 0; j < fields.length; ++j) {
      if (fields[j].startsWith('similarity')) return fields[j]
    }
  }
  for (let i = 0; i < types.length; ++i) {
    const type = types[i]
    const fields = fieldTypes[type]
    for (let j = 0; j < fields.length; ++j) {
      if (fields[j].toLowerCase().startsWith('similarity')) return fields[j]
    }
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case MODIFY_RACETRACK_WIDGET: {
      const widget = action.payload
      assert.ok(widget instanceof Widget)
      let similar = state.similar
      if (widget.type === SimilarHashWidgetInfo.type) {
        similar = extractSimilar(similar, widget)
      }
      const index = state.widgets.findIndex(w => w.id === widget.id)
      const widgets = [...state.widgets]
      if (index < 0) {
        widgets.push(widget)
      } else {
        widgets[index] = widget
      }
      return { ...state, widgets, similar }
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
      const similar = action.payload ? { ...state.similar, ...action.payload } : { ...state.similar, values: [], assetIds: [], weights: [] }
      assert.ok(Array.isArray(similar.values))
      assert.ok(Array.isArray(similar.assetIds))
      // Backwards compatibility for saved searches prior to weights
      if (similar.values && (!similar.weights || similar.weights.length !== similar.values.length)) similar.weights = similar.values.map(_ => (1))
      assert.ok(Array.isArray(similar.weights))
      assert.ok(similar.values.length === similar.assetIds.length)
      assert.ok(similar.values.length === similar.weights.length)
      assert.ok(similar.values.length <= 10)
      const index = state.widgets.findIndex(widget => (widget.type === SimilarHashWidgetInfo.type))
      if (index < 0) {
        let widgets = [...state.widgets]
        const widget = new Widget({ type: SimilarHashWidgetInfo.type })
        widgets.push(widget)
        return { ...state, similar, widgets }
      }
      return { ...state, similar }
    }
    case ASSET_ORDER:
    case ASSET_SORT: {
      const widgets = [...state.widgets]
      const similar = {...state.similar}
      if (action.type === ASSET_SORT || (action.payload && action.payload.length > 0)) {
        // Actively sorting by another field, remove all similar assets, add a sort widget if needed
        similar.values = []
        similar.assetIds = []
        const index = state.widgets.findIndex(widget => (widget.type === SortOrderWidgetInfo.type))
        if (index < 0) {
          const widget = new Widget({type: SortOrderWidgetInfo.type})
          widgets.push(widget)
        }
      }
      return { ...state, widgets, similar }
    }
    case ASSET_FIELDS: {
      // Scan available asset fields for the preferred or a valid field
      const field = bestSimilarityField(state.similar.field, action.payload)
      return { ...state, similar: { ...state.similar, field } }
    }
    case SELECT_FOLDERS: {
      const selectedFolderIds = action.payload
      if (selectedFolderIds.size) {
        const index = state.widgets.findIndex(widget => (widget.type === CollectionsWidgetInfo.type))
        if (index < 0) {
          const widget = new Widget({ type: CollectionsWidgetInfo.type })
          const widgets = [...state.widgets, widget]
          return { ...state, widgets }
        }
      }
      return state
    }
    case UNAUTH_USER:
      return initialState
  }

  return state
}
