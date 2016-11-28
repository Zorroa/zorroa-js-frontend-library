import { AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR, AUTH_PERMISSIONS } from '../constants/actionTypes'
import User from '../models/User'

export default function (state = {}, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, error: '', authenticated: action.payload.id > 0, user: action.payload }
    case UNAUTH_USER:
      return { ...state, authenticated: false }
    case AUTH_HOST:
      return { ...state, host: action.payload.host, protocol: action.payload.protocol }
    case AUTH_ERROR:
      return { ...state, error: action.payload }
    case AUTH_PERMISSIONS: {
      const user = new User(state.user)
      user.permissions = action.payload
      return { ...state, user }
    }
  }

  return state
}
