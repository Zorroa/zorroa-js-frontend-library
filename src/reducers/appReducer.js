import {
  SHOW_MODAL,
  HIDE_MODAL,
  SORT_FOLDERS,
  ICONIFY_LEFT_SIDEBAR,
  ICONIFY_RIGHT_SIDEBAR,
  TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS,
  ASSET_FIELDS,
  LIGHTBOX_METADATA,
  LIGHTBOX_PANNER,
  SET_DRAGGING,
  SHOULD_LOOP,
  THUMB_SIZE,
  THUMB_LAYOUT,
  SHOW_TABLE,
  TABLE_HEIGHT,
  SHOW_MULTIPAGE,
  VIDEO_VOLUME,
  HOVER_FIELD,
  CLEAR_HOVER_FIELD,
  USER_SETTINGS,
  UNAUTH_USER,
  SHOW_DIALOG_ALERT,
  HIDE_DIALOG_ALERT,
  SHOW_DIALOG_CONFIRM,
  HIDE_DIALOG_CONFIRM,
  SHOW_DIALOG_PROMPT,
  HIDE_DIALOG_PROMPT,
  THUMB_FIELD_TEMPLATE,
  LIGHTBAR_FIELD_TEMPLATE,
  DRAG_FIELD_TEMPLATE,
  UX_LEVEL,
  EMBEDMODE_ENABLED,
  MONOCHROME,
  SHOW_IMPORT,
  ARCHIVIST_SETTING,
  SHOW_QUICKVIEW,
  HIDE_QUICKVIEW,
  FLIPBOOK_FPS,
  TABLE_LAYOUTS,
  ADD_TABLE_LAYOUT,
  DELETE_TABLE_LAYOUT,
  SELECT_TABLE_LAYOUT,
} from '../constants/actionTypes'
import { DEFAULT_THUMBSIZE } from '../actions/appActions'
import { parseVariables, fieldsForVariables } from '../services/jsUtil'
import FieldList from '../models/FieldList'
import {
  defaultMetadataFields,
  defaultLightbarFields,
  defaultThumbFields,
  defaultDragFields,
  defaultThumbFieldTemplate,
  defaultLightbarFieldTemplate,
  defaultTableLayouts,
  defaultFpsFrequencies,
} from '../constants/defaultState'

const initialState = {
  modal: null,
  uxLevel: 0,
  embedModeEnabled: false,
  monochrome: false,
  leftSidebarIsIconified: false,
  rightSidebarIsIconified: true,
  collapsibleOpen: {
    browsing: false,
    library: true,
    home: false,
    smart: false,
    simple: false,
    explorer: false,
    metadata: false,
    importJobs: false,
    exportJobs: false,
    source: false,
    proxies: false,
    'proxies.proxies': false,
    jobErrors: false,
    jobPipelines: true,
    jobTasks: false,
  },
  metadataFields: [...defaultMetadataFields],
  lightbarFields: [...defaultLightbarFields],
  thumbFields: [...defaultThumbFields],
  dragFields: [...defaultDragFields],
  tableLayouts: [...defaultTableLayouts],
  selectedTableLayoutId: undefined,
  lightboxMetadata: { show: false, left: 20, top: 80, width: 300, height: 500 },
  thumbSize: DEFAULT_THUMBSIZE,
  thumbLayout: 'masonry',
  tableHeight: 300,
  showTable: false,
  videoVolume: 0.8,
  showMultipage: true,
  sortFolders: 'alpha-asc',
  hoverFields: new Set(),
  thumbFieldTemplate: defaultThumbFieldTemplate,
  lightbarFieldTemplate: defaultLightbarFieldTemplate,
  dragFieldTemplate: undefined,
  userSettings: {
    metadataFields: [...defaultMetadataFields],
    showTable: false,
    tableHeight: 300,
    thumbSize: DEFAULT_THUMBSIZE,
    thumbLayout: 'masonry',
    videoVolume: 0.8,
    showFolderCounts: 'filtered',
  },
  allAssetCount: 0,
  showQuickview: false,
  flipbookFps: defaultFpsFrequencies[0],
  shouldLoop: false,
}

export default function app(state = initialState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modal: action.payload }
    case HIDE_MODAL:
      return { ...state, modal: null }
    case SHOW_DIALOG_ALERT:
      return { ...state, dialogAlert: action.payload }
    case HIDE_DIALOG_ALERT:
      return { ...state, dialogAlert: null }
    case SHOW_DIALOG_CONFIRM:
      return { ...state, dialogConfirm: action.payload }
    case HIDE_DIALOG_CONFIRM:
      return { ...state, dialogConfirm: null }
    case SHOW_DIALOG_PROMPT:
      return { ...state, dialogPrompt: action.payload }
    case HIDE_DIALOG_PROMPT:
      return { ...state, dialogPrompt: null }
    case ICONIFY_LEFT_SIDEBAR:
      return { ...state, leftSidebarIsIconified: action.payload }
    case ICONIFY_RIGHT_SIDEBAR:
      return { ...state, rightSidebarIsIconified: action.payload }
    case TOGGLE_COLLAPSIBLE:
      const { collapsibleName, isOpen } = action.payload
      const collapsibleOpen = state.collapsibleOpen
      return {
        ...state,
        collapsibleOpen: { ...collapsibleOpen, [collapsibleName]: isOpen },
      }
    case ASSET_FIELDS: {
      // Remove any metadata or table fields that are not in the current repo
      const fieldSet = new Set()
      const fields = action.payload
      Object.keys(fields).forEach(type => {
        fields[type].forEach(field => {
          fieldSet.add(field)
        })
      })
      const metadataFields = state.metadataFields.filter(field =>
        fieldSet.has(field),
      )
      let tableLayouts = []
      state.tableLayouts.forEach(fieldList => {
        const dup = new FieldList(fieldList)
        if (dup.fields)
          dup.fields = dup.fields.filter(field => fieldSet.has(field))
        tableLayouts.push(dup)
      })
      return { ...state, metadataFields, tableLayouts }
    }
    case METADATA_FIELDS:
      return { ...state, metadataFields: action.payload }
    case TABLE_LAYOUTS:
      return { ...state, tableLayouts: action.payload }
    case ADD_TABLE_LAYOUT: {
      const tableLayouts = [...state.tableLayouts, action.payload]
      return {
        ...state,
        tableLayouts,
        selectedTableLayoutId: action.payload.id,
      }
    }
    case DELETE_TABLE_LAYOUT: {
      const layoutId = action.payload
      const index = state.tableLayouts.findIndex(
        layout => layout.id === layoutId,
      )
      const tableLayouts = [...state.tableLayouts]
      if (index >= 0) tableLayouts.splice(index, 1)
      let selectedTableLayoutId = state.selectedTableLayoutId
      if (state.selectedTableLayoutId === layoutId) {
        if (index === 0) selectedTableLayoutId = state.tableLayouts[0]
        else selectedTableLayoutId = state.tableLayouts[index - 1].id
      }
      return { ...state, tableLayouts, selectedTableLayoutId }
    }
    case SELECT_TABLE_LAYOUT: {
      const selectedTableLayoutId = action.payload
      if (
        state.tableLayouts &&
        state.tableLayouts.findIndex(
          layout => layout.id === selectedTableLayoutId,
        ) >= 0
      ) {
        return { ...state, selectedTableLayoutId }
      } else if (state.tableLayouts && state.tableLayouts.length) {
        return { ...state, selectedTableLayoutId: state.tableLayouts[0].id }
      }
      break
    }
    case LIGHTBOX_METADATA:
      return { ...state, lightboxMetadata: action.payload }
    case LIGHTBOX_PANNER:
      return { ...state, lightboxPanner: action.payload }
    case SET_DRAGGING:
      return { ...state, dragInfo: action.payload }
    case THUMB_SIZE:
      return { ...state, thumbSize: action.payload }
    case THUMB_LAYOUT:
      return { ...state, thumbLayout: action.payload }
    case SHOW_TABLE:
      return { ...state, showTable: action.payload }
    case SHOW_IMPORT:
      return { ...state, showImport: action.payload }
    case TABLE_HEIGHT:
      return { ...state, tableHeight: action.payload }
    case VIDEO_VOLUME:
      return { ...state, videoVolume: action.payload }
    case SHOW_MULTIPAGE:
      return { ...state, showMultipage: action.payload }
    case SORT_FOLDERS:
      return { ...state, sortFolders: action.payload }
    case HOVER_FIELD: {
      const hoverFields = new Set(state.hoverFields)
      hoverFields.add(action.payload)
      return { ...state, hoverFields }
    }
    case CLEAR_HOVER_FIELD: {
      const hoverFields = new Set(state.hoverFields)
      hoverFields.delete(action.payload)
      return { ...state, hoverFields }
    }
    case THUMB_FIELD_TEMPLATE: {
      const thumbFieldTemplate = action.payload
      const thumbFields = fieldsForVariables(parseVariables(thumbFieldTemplate))
      return { ...state, thumbFieldTemplate, thumbFields }
    }
    case LIGHTBAR_FIELD_TEMPLATE: {
      const lightbarFieldTemplate = action.payload
      const lightbarFields = fieldsForVariables(
        parseVariables(lightbarFieldTemplate),
      )
      return { ...state, lightbarFieldTemplate, lightbarFields }
    }
    case DRAG_FIELD_TEMPLATE: {
      const dragFieldTemplate = action.payload
      const dragFields =
        (dragFieldTemplate &&
          dragFieldTemplate.length &&
          fieldsForVariables(parseVariables(dragFieldTemplate))) ||
        defaultDragFields
      return { ...state, dragFieldTemplate, dragFields }
    }
    case ARCHIVIST_SETTING: {
      const setting = action.payload
      // Update the dragTemplate if it has not already been set by userSettings
      if (
        setting.name === 'curator.thumbnails.drag-template' &&
        !state.dragFieldTemplate
      ) {
        const dragFieldTemplate = setting.currentValue
        const dragFields = fieldsForVariables(parseVariables(dragFieldTemplate))
        return { ...state, dragFieldTemplate, dragFields }
      }
      return state
    }
    case UX_LEVEL: {
      return { ...state, uxLevel: action.payload }
    }
    case EMBEDMODE_ENABLED:
      return { ...state, embedModeEnabled: action.payload }
    case MONOCHROME: {
      return { ...state, monochrome: action.payload }
    }
    case USER_SETTINGS:
      // Override old settings with new settings.
      // This ensures we don't erase default settings.
      const oldUserSettings = state.userSettings
      const newUserSettings = action.payload.metadata
      return {
        ...state,
        userSettings: { ...oldUserSettings, ...newUserSettings },
      }
    case UNAUTH_USER:
      return initialState
    case SHOW_QUICKVIEW:
      return { ...state, showQuickview: true }
    case HIDE_QUICKVIEW:
      return { ...state, showQuickview: false }
    case FLIPBOOK_FPS:
      return { ...state, flipbookFps: action.payload }
    case SHOULD_LOOP:
      return { ...state, shouldLoop: action.payload }
    default:
      return state
  }
}
