import * as ACTION_TYPE from '../constants/actionTypes'

export function setCollapsibleOpen (collapsibleKey, isOpen) {
  return {
    type: (isOpen) ? ACTION_TYPE.CLOSE_COLLAPSIBLE : ACTION_TYPE.OPEN_COLLAPSIBLE,
    payload: { collapsibleKey, isOpen }
  }
}
