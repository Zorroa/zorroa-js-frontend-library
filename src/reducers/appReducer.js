import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE, METADATA_FIELDS, TABLE_FIELDS } from '../constants/actionTypes'

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
  }
  metadataFields: [ 'source.filename', 'source.date', 'source.fileSize' ],
  tableFields: [ 'source.filename', 'source.date', 'source.fileSize' ]
}

export default function app (state = initialState, action) {
  switch (action.type) {
    case MODAL:
      return {
        ...state,
        modal: (action.payload) ? action.payload : {}
      }
    case ICONIFY_LEFT_SIDEBAR:
      return {
        ...state,
        leftSidebarIsIconified: action.payload
      }
    case ICONIFY_RIGHT_SIDEBAR:
      return {
        ...state,
        rightSidebarIsIconified: action.payload
      }
    case TOGGLE_COLLAPSIBLE:
      const { collapsibleName, isOpen } = action.payload
      const collapsibleOpen = state.collapsibleOpen
      return {
        ...state,
        collapsibleOpen: { ...collapsibleOpen, [collapsibleName]: isOpen }
      }
    case METADATA_FIELDS:
      return { ...state, metadataFields: action.payload }
    case TABLE_FIELDS:
      return { ...state, tableFields: action.payload }
    default:
      return state
  }
}
