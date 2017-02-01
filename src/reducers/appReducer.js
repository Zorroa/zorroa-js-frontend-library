import {
  SHOW_MODAL, HIDE_MODAL, SORT_FOLDERS,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, TABLE_FIELDS, LIGHTBAR_FIELDS,
  SYNC_FIELDS, SHOW_IMPORT_SCRIPT_INFO,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT, VIDEO_VOLUME,
  USER_SETTINGS, UNAUTH_USER
} from '../constants/actionTypes'

export const defaultTableFieldWidth = 100
export const defaultTableFields = [ 'source.filename', 'source.date', 'source.fileSize' ]
export const defaultLightbarFields = [ 'source.filename', 'source.date' ]
const initialState = {
  modal: null,
  leftSidebarIsIconified: false,
  rightSidebarIsIconified: true,
  collapsibleOpen: {
    browsing: false,
    collection: false,
    smart: false,
    simple: false,
    metadata: false,
    source: false,
    proxies: false,
    'proxies.proxies': false
  },
  metadataFields: [ ...defaultTableFields ],
  tableFields: [ ...defaultTableFields ],
  lightbarFields: [ ...defaultLightbarFields ],
  tableFieldWidth: Object.assign({},
    ...defaultTableFields.map(field => ({ [field]: defaultTableFieldWidth }))),
  showImportScriptInfo: true,
  thumbSize: 128,
  thumbLayout: 'masonry',
  tableHeight: 300,
  showTable: false,
  videoVolume: 0.8,
  sortFolders: {},
  userSettings: {
    tableFields: [ ...defaultTableFields ],
    metadataFields: [ ...defaultTableFields ],
    showTable: false,
    tableHeight: 300,
    thumbSize: 128,
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
    case ICONIFY_LEFT_SIDEBAR:
      return { ...state, leftSidebarIsIconified: action.payload }
    case ICONIFY_RIGHT_SIDEBAR:
      return { ...state, rightSidebarIsIconified: action.payload }
    case TOGGLE_COLLAPSIBLE:
      const { collapsibleName, isOpen } = action.payload
      const collapsibleOpen = state.collapsibleOpen
      return { ...state, collapsibleOpen: { ...collapsibleOpen, [collapsibleName]: isOpen } }
    case METADATA_FIELDS:
      return { ...state, metadataFields: action.payload }
    case TABLE_FIELDS:
      // set default table widths for all new fields we haven't seen or set yet
      const tableFieldWidth = {
        // Start with the default width for all fields in response.
        ...Object.assign({}, ...action.payload.map(field => ({ [field]: defaultTableFieldWidth }))),
        // Override with all values we already have. Any new ones will be left at default width.
        ...state.tableFieldWidth
      }
      return { ...state, tableFields: action.payload, tableFieldWidth }
    case LIGHTBAR_FIELDS:
      return { ...state, lightbarFields: action.payload }
    case SYNC_FIELDS:
      return { ...state, syncMetadataAndTable: action.payload }
    case SHOW_IMPORT_SCRIPT_INFO:
      return { ...state, showImportScriptInfo: action.payload }
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
    case SORT_FOLDERS: {
      const { filter, order } = action.payload
      if (order === undefined) {
        if (state.sort[filter]) {
          const sort = {...state.sort}
          delete sort[filter]
          return sort
        }
      } else {
        return {...state, sortFolders: { ...state.sort, [filter]: order }}
      }
      break
    }
    case USER_SETTINGS:
      return { ...state, userSettings: action.payload.metadata }
    case UNAUTH_USER:
      return initialState
    default:
      return state
  }
}
