import * from '../constants/actionTypes'

const initialState = {
  sidebar: {
    racetrack: { open: true },
    folders: { open: true }
  }
}
export default function (state = initialState, action) {
  switch (action.type) {
    case OPEN_SIDEBAR_FOLDERS:
      return {...state, action.payload }
    case CLOSE_SIDEBAR_FOLDERS:
      return {...state, action.payload }
    case OPEN_SIDEBAR_RACETRACK:
      return {...state, action.payload }
    case CLOSE_SIDEBAR_RACETRACK:
      return {...state, action.payload }
  }

  return state
}
