import * as ACTION_TYPE from '../constants/actionTypes'

const initialState = {
  racetrack: { isOpen: true },
  folders: { isOpen: true }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPE.OPEN_SIDEBAR:
    case ACTION_TYPE.CLOSE_SIDEBAR:
      let newState = { ...state, [action.payload.sidebarKey]: { isOpen: action.payload.isOpen } }
      return newState
  }

  return state
}
