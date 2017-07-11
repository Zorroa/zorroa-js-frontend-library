import {
  SHOW_MODAL, HIDE_MODAL, SORT_FOLDERS,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, LIGHTBOX_METADATA, ASSET_FIELDS,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT,
  SHOW_MULTIPAGE, SHOW_PAGES, VIDEO_VOLUME,
  HOVER_FIELD, CLEAR_HOVER_FIELD,
  USER_SETTINGS, UNAUTH_USER,
  SHOW_DIALOG_ALERT, HIDE_DIALOG_ALERT,
  SHOW_DIALOG_CONFIRM, HIDE_DIALOG_CONFIRM,
  SHOW_DIALOG_PROMPT, HIDE_DIALOG_PROMPT,
  THUMB_FIELD_TEMPLATE, LIGHTBAR_FIELD_TEMPLATE,
  UX_LEVEL, MONOCHROME
} from '../constants/actionTypes'
import { DEFAULT_THUMBSIZE } from '../actions/appActions'
import { parseVariables, fieldsForVariables } from '../services/jsUtil'

export const defaultTableFieldWidth = 100
export const defaultMetadataFields = [ 'source.filename', 'source.date', 'source.fileSize' ]
export const defaultLightbarFields = [ 'source.type', 'source.filename', 'source.date', 'image.width', 'image.height', 'video.width', 'video.height' ]
export const defaultThumbFields = [ 'source.type', 'image.width', 'image.height', 'video.width', 'video.height' ]
const initialState = {
  modal: null,
  uxLevel: 0,
  monochrome: false,
  leftSidebarIsIconified: false,
  rightSidebarIsIconified: true,
  collapsibleOpen: {
    browsing: false,
    library: true,
    home: false,
    smart: false,
    simple: false,
    metadata: false,
    metadata2: false,
    source: false,
    proxies: false,
    'proxies.proxies': false
  },
  metadataFields: [ ...defaultMetadataFields ],
  lightbarFields: [ ...defaultLightbarFields ],
  thumbFields: [ ...defaultThumbFields ],
  lightboxMetadata: { show: false, left: 20, top: 80, width: 300, height: 500 },
  tableFieldWidth: Object.assign({},
    ...defaultMetadataFields.map(field => ({ [field]: defaultTableFieldWidth }))),
  thumbSize: DEFAULT_THUMBSIZE,
  thumbLayout: 'masonry',
  tableHeight: 300,
  showTable: false,
  videoVolume: 0.8,
  showMultipage: true,
  showPages: false,
  sortFolders: 'alpha-asc',
  hoverFields: new Set(),
  thumbFieldTemplate: '${image.width|video.width}x${image.height|video.height} ${source.type}',
  lightbarFieldTemplate: '${source.type} ${source.filename} ${image.width|video.width}x${image.height|video.height} ${source.date}',
  userSettings: {
    metadataFields: [ ...defaultMetadataFields ],
    showTable: false,
    tableHeight: 300,
    thumbSize: DEFAULT_THUMBSIZE,
    thumbLayout: 'masonry',
    videoVolume: 0.8
  }
}

export default function app (state = initialState, action) {
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
      return { ...state, collapsibleOpen: { ...collapsibleOpen, [collapsibleName]: isOpen } }
    case ASSET_FIELDS: {
      // Remove any metadata or table fields that are not in the current repo
      const fieldSet = new Set()
      const fields = action.payload
      Object.keys(fields).forEach(type => { fields[type].forEach(field => { fieldSet.add(field) }) })
      const metadataFields = state.metadataFields.filter(field => fieldSet.has(field))
      return { ...state, metadataFields }
    }
    case METADATA_FIELDS:
      // set default table widths for all new fields we haven't seen or set yet
      const tableFieldWidth = {
        // Start with the default width for all fields in response.
        ...Object.assign({}, ...action.payload.map(field => ({ [field]: defaultTableFieldWidth }))),
        // Override with all values we already have. Any new ones will be left at default width.
        ...state.tableFieldWidth
      }
      return { ...state, metadataFields: action.payload, tableFieldWidth }
    case LIGHTBOX_METADATA:
      return { ...state, lightboxMetadata: action.payload }
    case SET_DRAGGING:
      return { ...state, dragInfo: action.payload }
    case SET_TABLE_FIELD_WIDTH:
      return { ...state, tableFieldWidth: { ...state.tableFieldWidth, ...action.payload } }
    case THUMB_SIZE:
      return { ...state, thumbSize: action.payload }
    case THUMB_LAYOUT:
      return { ...state, thumbLayout: action.payload }
    case SHOW_TABLE:
      return { ...state, showTable: action.payload }
    case TABLE_HEIGHT:
      return { ...state, tableHeight: action.payload }
    case VIDEO_VOLUME:
      return { ...state, videoVolume: action.payload }
    case SHOW_MULTIPAGE:
      return { ...state, showMultipage: action.payload, showPages: action.payload }
    case SHOW_PAGES:
      return { ...state, showPages: action.payload }
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
      const lightbarFields = fieldsForVariables(parseVariables(lightbarFieldTemplate))
      return { ...state, lightbarFieldTemplate, lightbarFields }
    }
    case UX_LEVEL: {
      return { ...state, uxLevel: action.payload }
    }
    case MONOCHROME: {
      return { ...state, monochrome: action.payload }
    }
    case USER_SETTINGS:
      return { ...state, userSettings: action.payload.metadata }
    case UNAUTH_USER:
      return initialState
    default:
      return state
  }
}
