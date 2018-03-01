import {
  AUTH_USER, UNAUTH_USER, AUTH_ORIGIN, AUTH_ERROR, AUTH_PERMISSIONS, AUTH_HMAC,
  AUTH_SYNC, AUTH_CHANGE_PASSWORD, AUTH_DEFAULTS, AUTH_ONBOARDING, CLEAR_AUTH_ERROR} from '../constants/actionTypes'
import User from '../models/User'
import Permission from '../models/Permission'

const initialState = {
  sync: true
}

export default function (state = initialState, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, error: '', authenticated: action.payload.id > 0, user: action.payload }
    case UNAUTH_USER:
      return { ...state, authenticated: false }
    case AUTH_ORIGIN:
      return { ...state, origin: action.payload }
    case AUTH_ERROR:
      return { ...state, error: action.payload }
    case CLEAR_AUTH_ERROR: {
      return { ...state, error: undefined }
    }
    case AUTH_PERMISSIONS: {
      const user = new User(state.user)
      user.permissions = action.payload
      let isAdministrator = false
      let isDeveloper = false
      let isManager = false
      let isSharer = false
      user.permissions && user.permissions.forEach(permission => {
        if (permission.equals(Permission.Administrator, Permission.GroupType)) isAdministrator = true
        if (permission.equals(Permission.Developer, Permission.GroupType)) isDeveloper = true
        if (permission.equals(Permission.Manager, Permission.GroupType)) isManager = true
        if (permission.equals(Permission.Share, Permission.GroupType)) isSharer = true
      })
      return { ...state, user, isAdministrator, isManager, isDeveloper, isSharer }
    }
    case AUTH_SYNC:
      return { ...state, sync: action.payload }
    case AUTH_DEFAULTS:
      return { ...state, defaults: action.payload }
    case AUTH_CHANGE_PASSWORD:
      return { ...state, changePassword: action.payload }
    case AUTH_ONBOARDING:
      return { ...state, onboarding: action.payload }
    case AUTH_HMAC:
      return { ...state, hmacKey: action.payload }
  }

  return state
}
