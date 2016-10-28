import * as ACTION_TYPE from '../constants/actionTypes'

const initialState = {
  racetrack: { open: true },
  folders: { open: true }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPE.OPEN_SIDEBAR:
    case ACTION_TYPE.CLOSE_SIDEBAR:
      let newState = { ...state, [action.payload.sidebarKey]: { open: action.payload.isOpen } }
      return newState
  }

  return state
}
