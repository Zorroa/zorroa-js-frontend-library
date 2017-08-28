import {
  MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  SIMILAR_VALUES, ASSET_ORDER, ASSET_SORT, ASSET_FIELDS, SELECT_FOLDERS,
  SELECT_JOBS, ANALYZE_SIMILAR, UNAUTH_USER, ISOLATE_PARENT } from '../constants/actionTypes'
import Widget, { createImportSetWidget } from '../models/Widget'
import {
  SimilarHashWidgetInfo, CollectionsWidgetInfo, SortOrderWidgetInfo,
  MultipageWidgetInfo, ImportSetWidgetInfo } from '../components/Racetrack/WidgetInfo'
import * as assert from 'assert'

const initialState = {
  widgets: [],
  similar: { field: null, values: [], ofsIds: [] }
}

function extractSimilar (similar, widget) {
  assert.ok(widget.type === SimilarHashWidgetInfo.type)
  if (!widget.field || !widget.field.length) return similar
  const field = widget.field.replace(/\.raw$/, '')
  const hamming = widget && widget.sliver && widget.sliver.filter && widget.sliver.filter.hamming
  if (hamming) {
    if (!hamming.hashes || !hamming.hashes.length) widget.sliver.filter = null  // Remove invalid empty filter
  }
  return { ...similar, field }
}

function fieldExists (field, fieldTypes) {
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

function updateSimilarity (similar, state) {
  assert.ok(Array.isArray(similar.values))
  assert.ok(Array.isArray(similar.ofsIds))
  // Backwards compatibility for saved searches prior to weights
  if (similar.values && (!similar.weights || similar.weights.length !== similar.values.length)) similar.weights = similar.values.map(_ => (1))
  assert.ok(Array.isArray(similar.weights))
  assert.ok(similar.values.length === similar.ofsIds.length)
  assert.ok(similar.values.length === similar.weights.length)
  assert.ok(similar.values.length <= 10)
  const index = state.widgets.findIndex(widget => (widget.type === SimilarHashWidgetInfo.type))
  if (index < 0 && similar.values.length) {
    let widgets = [...state.widgets]
    const isEnabled = true
    const isPinned = false
    const widget = SimilarHashWidgetInfo.create(undefined, undefined, isEnabled, isPinned)
    widgets.push(widget)
    return { ...state, similar, widgets }
  }
  return { ...state, similar }
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
      const similar = action.payload ? { ...state.similar, ...action.payload } : { ...state.similar, values: [], ofsIds: [], weights: [] }
      return updateSimilarity(similar, state)
    }
    case ANALYZE_SIMILAR: {
      const assets = action.payload
      const values = assets.map(asset => asset.rawValue(state.similar.field))
      const ofsIds = assets.map(asset => asset.closestProxy(256, 256).id)
      const similar = { ...state.similar, values, ofsIds }
      return updateSimilarity(similar, state)
    }
    case ASSET_ORDER:
    case ASSET_SORT: {
      const widgets = [...state.widgets]
      const similar = {...state.similar}
      if (action.type === ASSET_SORT || (action.payload && action.payload.length > 0)) {
        // Actively sorting by another field, remove all similar assets, add a sort widget if needed
        similar.values = []
        similar.ofsIds = []
        const index = state.widgets.findIndex(widget => (widget.type === SortOrderWidgetInfo.type))
        if (index < 0) {
          const widget = SortOrderWidgetInfo.create()
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
          const widget = CollectionsWidgetInfo.create()
          const widgets = [...state.widgets, widget]
          return { ...state, widgets }
        }
      }
      return state
    }
    case SELECT_JOBS: {
      const selectedJobIds = action.payload
      if (selectedJobIds.size) {
        const index = state.widgets.findIndex(widget => (widget.type === ImportSetWidgetInfo.type))
        if (index < 0) {
          const isEnabled = true
          const isPinned = false
          const widget = createImportSetWidget(undefined, undefined, isEnabled, isPinned)
          const widgets = [...state.widgets, widget]
          return {...state, widgets}
        }
      }
      return state
    }
    case ISOLATE_PARENT: {
      const isolatedParent = action.payload
      if (isolatedParent) {
        const widgets = [...state.widgets]
        const sortByPage = false
        const filterMultipage = false
        const index = state.widgets.findIndex(widget => (widget.type === MultipageWidgetInfo.type))
        const isEnabled = index >= 0 ? state.widgets[index].isEnabled : true
        const isPinned = index >= 0 ? state.widgets[index].isPinned : false
        const widget = MultipageWidgetInfo.create(undefined, undefined, isolatedParent, sortByPage, filterMultipage, isEnabled, isPinned)
        if (index < 0) {
          widgets.push(widget)
        } else {
          widget.id = widgets[index].id
          widgets[index] = widget
        }
        return {...state, widgets}
      }
      return state
    }
    case UNAUTH_USER:
      return initialState
  }

  return state
}
