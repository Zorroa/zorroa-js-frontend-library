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
  CLEAR_AUTH_ERROR,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_REQUEST_SUCCESS,
  RESET_PASSWORD_REQUEST_ERROR,
  PASSWORD_RESET,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_ERROR,
  SAML_OPTIONS_REQUEST,
  SAML_OPTIONS_REQUEST_SUCCESS,
  SAML_OPTIONS_REQUEST_ERROR,
  SIGNIN_USER,
  SIGNIN_USER_SUCCESS,
  SIGNIN_USER_ERROR,
  SESSION_TIMEOUT,
} from '../constants/actionTypes'
import User from '../models/User'
import Permission from '../models/Permission'

const initialState = {
  sync: true,
  source: 'local',
  userSigninStatus: undefined,
  passwordResetRequestStatus: undefined,
  passwordResetStatus: undefined,
  shouldShowLogout: true,
  samlUrl: '',
  samlOptionsStatus: 'pending',
  passwordResetErrorCause: undefined,
  passwordResetErrorMessage: undefined,
  passwordResetException: undefined,
  userSigninErrorStatusCode: undefined,
  sessionExpired: false,
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
    case AUTH_HMAC:
      return { ...state, hmacKey: action.payload }
    case RESET_PASSWORD_REQUEST:
      return { ...state, passwordResetRequestStatus: 'pending' }
    case RESET_PASSWORD_REQUEST_SUCCESS:
      return { ...state, passwordResetRequestStatus: 'succeeded' }
    case RESET_PASSWORD_REQUEST_ERROR:
      return { ...state, passwordResetRequestStatus: 'errored' }
    case PASSWORD_RESET:
      return {
        ...state,
        passwordResetStatus: 'pending',
        passwordResetErrorCause: undefined,
        passwordResetErrorMessage: undefined,
        passwordResetException: undefined,
      }
    case PASSWORD_RESET_SUCCESS:
      return { ...state, passwordResetStatus: 'succeeded' }
    case PASSWORD_RESET_ERROR:
      return {
        ...state,
        passwordResetStatus: 'errored',
        passwordResetErrorCause: action.payload.cause,
        passwordResetErrorMessage: action.payload.message,
        passwordResetException: action.payload.exception,
      }
    case SIGNIN_USER:
      return {
        ...state,
        userSigninStatus: 'pending',
        userSigninErrorStatusCode: undefined,
      }
    case SIGNIN_USER_SUCCESS:
      return { ...state, userSigninStatus: 'succeeded' }
    case SIGNIN_USER_ERROR:
      return {
        ...state,
        userSigninStatus: 'errored',
        userSigninErrorStatusCode: action.payload.statusCode,
      }
    case SAML_OPTIONS_REQUEST:
      return { ...state, samlOptionsStatus: 'pending' }
    case SAML_OPTIONS_REQUEST_SUCCESS:
      const shouldShowLogout = action.payload.logout
      const samlOptions = urlParse(action.payload.idps[0], true)
      return {
        ...state,
        shouldShowLogout,
        samlUrl: samlOptions.query.idp,
        samlOptionsStatus: 'success',
      }
    case SAML_OPTIONS_REQUEST_ERROR:
      return {
        ...state,
        samlUrl: '',
        shouldShowLogout: true,
        samlOptionsStatus: 'error',
      }

    case SESSION_TIMEOUT:
      return {
        ...state,
        sessionExpired: action.payload,
      }
  }

  return state
}
