import {
  AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR, AUTH_PERMISSIONS,
  AUTH_SYNC, AUTH_CHANGE_PASSWORD, AUTH_DEFAULTS } from '../constants/actionTypes'
import User from '../models/User'

const initialState = {
  sync: true
}

export default function (state = initialState, action) {
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
    case AUTH_SYNC:
      return { ...state, sync: action.payload }
    case AUTH_DEFAULTS:
      return { ...state, defaults: action.payload }
    case AUTH_CHANGE_PASSWORD: {
      return { ...state, changePassword: action.payload }
    }
  }

  return state
}
