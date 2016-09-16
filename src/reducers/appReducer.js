import { SPINNER, MODAL } from '../actions/appActions'

export default function app (state, action) {
  switch (action.type) {
    case SPINNER:
      return Object.assign({}, state, {
        showSpinner: action.payload
      })
    case MODAL:
      if (action.payload) {
        return Object.assign({}, state, {
          modal: action.payload
        })
      } else {
        return Object.assign({}, state, {
          modal: null
        })
      }
    default:
      return state
  }
}
