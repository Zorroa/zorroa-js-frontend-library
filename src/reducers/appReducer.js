import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE } from '../constants/actionTypes'

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
    default:
      return state
  }
}
