import * as ACTION_TYPE from '../constants/actionTypes'

export default function setSidebarOpen (sidebarKey, isOpen) {
  return {
    type: (isOpen) ? ACTION_TYPE.CLOSE_SIDEBAR : ACTION_TYPE.OPEN_SIDEBAR,
    payload: { sidebarKey, isOpen }
  }
}
