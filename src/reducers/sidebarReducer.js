import * from '../constants/actionTypes'

const initialState = {
  sidebar: {
    racetrack: { squeezed: false },
    folders: { squeezed: false }
  }
}
export default function (state = initialState, action) {
  switch (action.type) {
    case EXPAND_SIDEBAR_FOLDERS:
      return {...state, action.payload }
    case SQUEEZE_SIDEBAR_FOLDERS:
      return {...state, action.payload }
    case EXPAND_SIDEBAR_RACETRACK:
      return {...state, action.payload }
    case SQUEEZE_SIDEBAR_RACETRACK:
      return {...state, action.payload }
  }

  return state
}
