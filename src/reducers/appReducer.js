import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR } from '../constants/actionTypes'

const initialState = {
  modal: {},
  leftSidebarIsIconified: false,
  rightSidebarIsIconified: false
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
    default:
      return state
  }
}
