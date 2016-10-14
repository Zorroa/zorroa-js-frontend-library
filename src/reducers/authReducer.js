import { AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR } from '../constants/actionTypes'

export default function (state = {}, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, error: '', authenticated: action.payload.id > 0, user: action.payload }
    case UNAUTH_USER:
      return { ...state, authenticated: false }
    case AUTH_HOST:
      return { ...state, host: action.payload }
    case AUTH_ERROR:
      return { ...state, error: action.payload }
  }

  return state
}