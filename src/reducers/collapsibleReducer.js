import * as ACTION_TYPE from '../constants/actionTypes'

const initialState = {
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPE.OPEN_COLLAPSIBLE:
    case ACTION_TYPE.CLOSE_COLLAPSIBLE:
      let newState = { ...state, [action.payload.collapsibleKey]: { isOpen: action.payload.isOpen } }
      return newState
  }

  return state
}
