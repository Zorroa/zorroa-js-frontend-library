import { MODAL } from '../constants/actionTypes'

const initialState = {
  modal: {}
}

export default function app (state = initialState, action) {
  switch (action.type) {
    case MODAL:
      return {
        ...state,
        modal: (action.payload) ? action.payload : {}
      }
    default:
      return state
  }
}
