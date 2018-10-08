import { SET_DARK_MODE } from '../constants/actionTypes'

const initialState = {
  isDarkMode: false,
}

export default function app(state = initialState, action) {
  switch (action.type) {
    case SET_DARK_MODE:
      return { ...state, isDarkMode: action.payload }
    default:
      return state
  }
}
