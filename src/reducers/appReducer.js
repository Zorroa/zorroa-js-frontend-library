import {
  SHOW_MODAL, HIDE_MODAL,
  SHOW_DISPLAY_OPTIONS_MODAL, HIDE_DISPLAY_OPTIONS_MODAL,
  SHOW_CREATE_FOLDER_MODAL, HIDE_CREATE_FOLDER_MODAL,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, TABLE_FIELDS, SYNC_FIELDS,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH, UNAUTH_USER
} from '../constants/actionTypes'

export const defaultTableFieldWidth = 100
export const defaultTableFields = [ 'source.filename', 'source.date', 'source.fileSize' ]

const initialState = {
  modal: {},
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
  tableFieldWidth: Object.assign({},
    ...defaultTableFields.map(field => ({ [field]: defaultTableFieldWidth })))
}

export default function app (state = initialState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modal: action.payload }
    case HIDE_MODAL:
      return { ...state, modal: null }
    case SHOW_DISPLAY_OPTIONS_MODAL:
      return { ...state, displayOptions: action.payload }
    case HIDE_DISPLAY_OPTIONS_MODAL:
      return { ...state, displayOptions: null }
    case SHOW_CREATE_FOLDER_MODAL:
      return { ...state, createFolder: action.payload }
    case HIDE_CREATE_FOLDER_MODAL:
      return { ...state, createFolder: null }
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
    case SYNC_FIELDS:
      return { ...state, syncMetadataAndTable: action.payload }
    case SET_DRAGGING:
      return { ...state, isDragging: action.payload }
    case SET_TABLE_FIELD_WIDTH:
      return { ...state, tableFieldWidth: { ...state.tableFieldWidth, ...action.payload } }
    case UNAUTH_USER:
      return initialState
    default:
      return state
  }
}
