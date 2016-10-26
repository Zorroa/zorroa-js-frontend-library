import * as ACTION_TYPE from '../constants/actionTypes'

const initialState = {
  racetrack: { open: true },
  folders: { open: true }
}
export default function (state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPE.OPEN_SIDEBAR_FOLDERS:
      return {...state, sidebar: action.payload }
    case ACTION_TYPE.CLOSE_SIDEBAR_FOLDERS:
      return {...state, sidebar: action.payload }
    case ACTION_TYPE.OPEN_SIDEBAR_RACETRACK:
      return {...state, sidebar: action.payload }
    case ACTION_TYPE.CLOSE_SIDEBAR_RACETRACK:
      return {...state, sidebar: action.payload }
  }

  return state
}
