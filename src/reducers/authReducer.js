import urlParse from 'url-parse'
import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ORIGIN,
  AUTH_ERROR,
  AUTH_PERMISSIONS,
  AUTH_HMAC,
  AUTH_SYNC,
  AUTH_CHANGE_PASSWORD,
  AUTH_DEFAULTS,
  AUTH_ONBOARDING,
  CLEAR_AUTH_ERROR,
  SAML_OPTIONS_REQUEST,
  SAML_OPTIONS_REQUEST_SUCCESS,
  SAML_OPTIONS_REQUEST_ERROR,
} from '../constants/actionTypes'
import User from '../models/User'
import Permission from '../models/Permission'

const initialState = {
  sync: true,
  source: 'local',
  shouldHideLogout: false,
  samlUrl: '',
  samlOptionsStatus: 'pending',
}

export default function(state = initialState, action) {
  switch (action.type) {
    case AUTH_USER:
      const source = action.payload.source || state.source
      return {
        ...state,
        error: '',
        source,
        authenticated: !!action.payload.user.id,
        user: action.payload.user,
      }
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
      let isLibrarian = false
      let isExporter = false
      user.permissions &&
        user.permissions.forEach(permission => {
          if (permission.equals(Permission.Administrator, Permission.GroupType))
            isAdministrator = true
          if (permission.equals(Permission.Developer, Permission.GroupType))
            isDeveloper = true
          if (permission.equals(Permission.Manager, Permission.GroupType))
            isManager = true
          if (permission.equals(Permission.Share, Permission.GroupType))
            isSharer = true
          if (permission.equals(Permission.Librarian, Permission.GroupType))
            isLibrarian = true
          if (permission.equals(Permission.Export, Permission.GroupType))
            isExporter = true
        })
      return {
        ...state,
        user,
        isAdministrator,
        isManager,
        isDeveloper,
        isSharer,
        isLibrarian,
        isExporter,
      }
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
    case SAML_OPTIONS_REQUEST:
      return { ...state, samlOptionsStatus: 'pending' }
    case SAML_OPTIONS_REQUEST_SUCCESS: {
      const shouldHideLogout = action.payload.logout
      const samlOptions = urlParse(action.payload.idps[0], true)
      return {
        ...state,
        shouldHideLogout,
        samlUrl: samlOptions.query.idp,
        samlOptionsStatus: 'success',
      }
    }
    case SAML_OPTIONS_REQUEST_ERROR:
      return {
        ...state,
        samlUrl: '',
        shouldHideLogout: false,
        samlOptionsStatus: 'error',
      }
  }

  return state
}
