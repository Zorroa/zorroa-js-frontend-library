import {
  MODIFY_RACETRACK_WIDGET, REMOVE_RACETRACK_WIDGET_IDS, RESET_RACETRACK_WIDGETS,
  ASSET_ORDER, ASSET_SORT, SELECT_FOLDERS,
  SELECT_JOBS, ANALYZE_SIMILAR, UNAUTH_USER, ISOLATE_PARENT, SIMILAR_MINSCORE,
  UPSERT_RACETRACK_WIDGETS, ISOLATE_FLIPBOOK, DEISOLATE_FLIPBOOK
} from '../constants/actionTypes'
import Widget from '../models/Widget'
import {
  SimilarHashWidgetInfo, CollectionsWidgetInfo, SortOrderWidgetInfo,
  MultipageWidgetInfo, ImportSetWidgetInfo, FlipbookWidgetInfo, FiletypeWidgetInfo } from '../components/Racetrack/WidgetInfo'
import * as assert from 'assert'

const initialState = {
  widgets: [],
  similarMinScore: {/* field: lastMinScore */}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case MODIFY_RACETRACK_WIDGET: {
      const widget = action.payload
      assert.ok(widget instanceof Widget)
      const index = state.widgets.findIndex(w => w.id === widget.id)
      const widgets = [...state.widgets]
      if (index < 0) {
        widgets.push(widget)
      } else {
        widgets[index] = widget
      }
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
    case UPSERT_RACETRACK_WIDGETS: {
      const widgets = [...state.widgets]
      action.payload.forEach(widget => {
        const index = widgets.findIndex(w => w.id === widget.id)
        if (index < 0) {
          widgets.push(widget)
        } else {
          widgets[index] = widget
        }
      })
      return { ...state, widgets }
    }
    case ANALYZE_SIMILAR: {
      const assets = action.payload
      const similarity = assets[0].rawValue('similarity')
      const similarField = Object.keys(similarity)[0]
      const hash = 'foobar'
      const proxy = assets[0].closestProxy(256, 256)
      const ofsId = proxy && proxy.id
      const hashes = assets.map(() => ({ hash, ofsId, weight: 1 }))
      const minScore = state.minScore[state.similarField] || 75
      let widgets = [...state.widgets]
      const index = widgets.findIndex(widget => widget.type === SimilarHashWidgetInfo.type && widget.field === similarField)
      const isEnabled = true
      const isPinned = false
      const widget = SimilarHashWidgetInfo.create(similarField, null, hashes, minScore, isEnabled, isPinned)
      if (index >= 0) {
        widgets[index] = widget
      } else {
        widgets.push(widget)
      }
      return { ...state, widgets }
    }
    case SIMILAR_MINSCORE: {
      const { field, minScore } = action.payload
      const similarMinScore = { ...state.similarMinScore, [field]: minScore }
      return { ...state, similarMinScore }
    }
    case ASSET_ORDER:
    case ASSET_SORT: {
      if (action.payload && action.payload.silent === true) {
        // Do not add the sort order racebar if this is a "silent" change
        return state
      }

      const widgets = [...state.widgets]
      if (action.type === ASSET_SORT || (action.payload && action.payload.length > 0)) {
        // Actively sorting by another field, add a sort widget if needed
        const index = state.widgets.findIndex(widget => (widget.type === SortOrderWidgetInfo.type))
        if (index < 0) {
          const widget = SortOrderWidgetInfo.create()
          widgets.push(widget)
        }
      }
      return { ...state, widgets }
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
          const widget = ImportSetWidgetInfo.create(undefined, undefined, isEnabled, isPinned)
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
    case DEISOLATE_FLIPBOOK: {
      const widgets = state.widgets.reduce((newWidgets, widget) => {
        if (widget.type === FiletypeWidgetInfo.type) {
          // Re-enable the FileType widget
          newWidgets.push({
            ...widget,
            isEnabled: true
          })

          return newWidgets
        } else if (widget.type !== FlipbookWidgetInfo.type) {
          // Removes the FlipbookWidget by only adding non-Flipbook widgets
          newWidgets.push(widget)
        }

        return newWidgets
      }, [])
      return {...state, widgets}
    }
    case ISOLATE_FLIPBOOK: {
      const flipbook = action.payload

      if (flipbook) {
        const sortByPage = true
        const index = state.widgets.findIndex(widget => (widget.type === FlipbookWidgetInfo.type))
        const isEnabled = index >= 0 ? state.widgets[index].isEnabled : true
        const widgetState = {
          id: flipbook.id,
          title: flipbook.document.source.filename
        }
        const widget = FlipbookWidgetInfo.create(
          sortByPage,
          flipbook,
          isEnabled,
          true,
          widgetState
        )
        const widgets = [widget]
        return {...state, widgets}
      }
      return state
    }
    case UNAUTH_USER:
      return initialState
  }

  return state
}
