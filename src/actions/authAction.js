import axios from 'axios'
import * as api from '../globals/api.js'

import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ORIGIN,
  AUTH_ERROR,
  USER_SETTINGS,
  AUTH_PERMISSIONS,
  AUTH_SYNC,
  METADATA_FIELDS,
  AUTH_HMAC,
  CLEAR_AUTH_ERROR,
  THUMB_SIZE,
  THUMB_LAYOUT,
  SHOW_TABLE,
  TABLE_HEIGHT,
  VIDEO_VOLUME,
  AUTH_CHANGE_PASSWORD,
  AUTH_DEFAULTS,
  UX_LEVEL,
  MONOCHROME,
  THUMB_FIELD_TEMPLATE,
  LIGHTBAR_FIELD_TEMPLATE,
  DRAG_FIELD_TEMPLATE,
  LIST_SERVER_IMPORT_FILES,
  GET_SERVER_DEFAULT_PATH,
  LIGHTBOX_METADATA,
  LIGHTBOX_PANNER,
  TABLE_LAYOUTS,
  SELECT_TABLE_LAYOUT,
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
import { USER_ITEM, ORIGIN_ITEM } from '../constants/localStorageItems'
import User from '../models/User'
import AclEntry from '../models/Acl'
import FieldList from '../models/FieldList'
import Permission from '../models/Permission'
import { archivistSetting } from './archivistAction'
import { defaultTableFields } from '../constants/defaultState'
import saml from '../api/saml'

// Global variable to hold axios connection
// FIXME: Should this be state?
var archivist

// Create the global axios connection, on login or refresh.
// Note this is not an action creator, so it should probably
// be in another file, but we need access to archivist global.
export function createArchivist(dispatch, origin) {
  // Override origin in production or update if not set
  if (PROD || !origin || !origin.length) {
    origin = window.location.origin
  }
  if (!archivist || archivist.origin !== origin) {
    // Use withCredentials to handle CORS certification.
    archivist = axios.create({ baseURL: origin, withCredentials: true })
  }
  dispatch({ type: AUTH_ORIGIN, payload: origin })
  localStorage.setItem(ORIGIN_ITEM, origin)
}

// // Return the axios connection for other action creators
// export function getArchivist () {
//   return archivist
// }

function startRequest(dispatch) {
  if (api.getRequestsSynced()) {
    requestAnimationFrame(_ => dispatch({ type: AUTH_SYNC, payload: false }))
  }
  api.incRequestSentCounter()
}

function finishRequest(dispatch, requestProm) {
  return requestProm.then(
    response => {
      requestAnimationFrame(_ => {
        api.incRequestReceivedCounter()
        if (api.getRequestsSynced())
          dispatch({ type: AUTH_SYNC, payload: true })
      })
      return response
    },
    error => {
      requestAnimationFrame(_ => {
        api.incRequestReceivedCounter()
        if (api.getRequestsSynced())
          dispatch({ type: AUTH_SYNC, payload: true })
      })
      return Promise.reject(error)
    },
  )
}

export function archivistGet(dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.get.apply(this, args))
}

export function archivistPost(dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.post.apply(this, args))
}

export function archivistPut(dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.put.apply(this, args))
}

export function archivistDelete(dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.delete.apply(this, args))
}

export function archivistRequest(dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.apply(this, args))
}

export function archivistBaseURL() {
  return archivist && archivist.defaults.baseURL
}

export function validateUser(origin) {
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, origin)
    archivistGet(dispatch, '/api/v1/who', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }, // disable browser auth
    })
      .then(response => {
        authorize(dispatch, response.data)
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          dispatch({ type: UNAUTH_USER, payload: error.response.data })
        } else {
        }
      })
  }
}

export function signinDefaults(username, origin) {
  return {
    type: AUTH_DEFAULTS,
    payload: { username, origin },
  }
}

export function signinUser(username, password, origin) {
  // Submit username+password to server
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, origin)
    dispatch({
      type: SIGNIN_USER,
      payload: {},
    })
    archivistPost(
      dispatch,
      '/api/v1/login',
      {},
      {
        withCredentials: true,
        auth: { username, password },
        headers: { 'X-Requested-With': 'XMLHttpRequest' }, // disable browser auth
      },
    )
      .then(response => {
        dispatch({
          type: SIGNIN_USER_SUCCESS,
          payload: {},
        })
        authorize(dispatch, response.data)
      })
      .catch(error => {
        dispatch({
          type: SIGNIN_USER_ERROR,
          payload: {
            statusCode: error.response && error.response.status,
          },
        })
        dispatch(authError('Bad Login Info', error))
      })
  }
}

function authorize(dispatch, json) {
  const user = new User(json)
  const source = json.source
  dispatch({
    type: AUTH_USER,
    payload: {
      user,
      source,
    },
  })
  localStorage.setItem(USER_ITEM, JSON.stringify(user))
  const metadata = json.settings && json.settings.metadata

  // TODO: load these all up in one HTTP request to conserve number of concurrent outgoing connections
  dispatch(archivistSetting('curator.lightbox.zoom-min'))
  dispatch(archivistSetting('curator.lightbox.zoom-max'))
  dispatch(archivistSetting('archivist.export.maxAssetCount'))

  if (metadata) {
    dispatch({ type: USER_SETTINGS, payload: { user, metadata } })
    // FIXME: Should move to settings.search in server?
    /* FIXME: Disable restoring the search due to user conflicts.
    if (metadata.search) {
      const query = new AssetSearch(metadata.search)
      dispatch(restoreSearch(query))
    }
    */
    if (metadata.metadataFields) {
      const fields = new Set()
      if (metadata.metadataFields)
        metadata.metadataFields.forEach(f => fields.add(f))
      const payload = [...fields]
      dispatch({ type: METADATA_FIELDS, payload })
    }
    if (Array.isArray(metadata.tableLayouts)) {
      const tableLayouts = metadata.tableLayouts.map(
        json => new FieldList(json),
      )
      dispatch({ type: TABLE_LAYOUTS, payload: tableLayouts })
      dispatch({
        type: SELECT_TABLE_LAYOUT,
        payload: metadata.selectedTableLayoutId,
      })
    } else {
      const id = `${user.id}-`
      const name = `${user.firstName} Default`
      const acl = [
        new AclEntry({
          permissionId: user.permissionId,
          access: AclEntry.ReadAccess | AclEntry.WriteAccess,
        }),
      ]
      const layout = new FieldList({
        id,
        name,
        acl,
        fields: defaultTableFields,
      })
      const tableLayouts = [layout]
      metadata.tableLayouts = tableLayouts
      dispatch({ type: USER_SETTINGS, payload: { user, metadata } })
      dispatch({ type: TABLE_LAYOUTS, payload: [layout] })
      dispatch({ type: SELECT_TABLE_LAYOUT, payload: id })
    }
    if (metadata.thumbSize) {
      dispatch({ type: THUMB_SIZE, payload: metadata.thumbSize })
    }
    if (metadata.thumbLayout !== undefined) {
      dispatch({ type: THUMB_LAYOUT, payload: metadata.thumbLayout })
    }
    if (metadata.showTable !== undefined) {
      dispatch({ type: SHOW_TABLE, payload: metadata.showTable })
    }
    if (metadata.tableHeight) {
      dispatch({ type: TABLE_HEIGHT, payload: metadata.tableHeight })
    }
    if (metadata.videoVolume !== undefined) {
      dispatch({ type: VIDEO_VOLUME, payload: metadata.videoVolume })
    }
    if (metadata.uxLevel !== undefined) {
      dispatch({ type: UX_LEVEL, payload: metadata.uxLevel })
    }
    if (metadata.monochrome !== undefined) {
      dispatch({ type: MONOCHROME, payload: metadata.monochrome })
    }
    if (metadata.thumbFieldTemplate !== undefined) {
      dispatch({
        type: THUMB_FIELD_TEMPLATE,
        payload: metadata.thumbFieldTemplate,
      })
    }
    if (metadata.lightbarFieldTemplate !== undefined) {
      dispatch({
        type: LIGHTBAR_FIELD_TEMPLATE,
        payload: metadata.lightbarFieldTemplate,
      })
    }
    if (metadata.dragFieldTemplate !== undefined) {
      dispatch({
        type: DRAG_FIELD_TEMPLATE,
        payload: metadata.dragFieldTemplate,
      })
    } else {
      dispatch(archivistSetting('curator.thumbnails.drag-template'))
    }
    if (metadata.lightboxMetadata !== undefined) {
      dispatch({ type: LIGHTBOX_METADATA, payload: metadata.lightboxMetadata })
    }
    if (metadata.lightboxPanner !== undefined) {
      dispatch({ type: LIGHTBOX_PANNER, payload: metadata.lightboxPanner })
    }
  }
}

export function forgotPassword(email) {
  return dispatch => {
    dispatch({
      type: RESET_PASSWORD_REQUEST,
      payload: {},
    })

    archivistPost(dispatch, '/api/v1/send-password-reset-email', {
      email,
    }).then(
      ({ data }) => {
        dispatch({ type: UNAUTH_USER, payload: data })
        dispatch({
          type: RESET_PASSWORD_REQUEST_SUCCESS,
          payload: data,
        })
      },
      error => {
        dispatch({
          type: RESET_PASSWORD_REQUEST_ERROR,
          payload: error,
        })
      },
    )
  }
}

export function changePassword(state) {
  return {
    type: AUTH_CHANGE_PASSWORD,
    payload: state,
  }
}

export function updatePassword(user, password) {
  return dispatch => {
    user = new User({ ...user, password })
    archivistPut(
      dispatch,
      '/api/v1/users/' + user.id,
      { ...user, password },
      {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }, // disable browser auth
      },
    )
      .then(response => {
        dispatch({ type: AUTH_CHANGE_PASSWORD, payload: false })
      })
      .catch(error =>
        dispatch(
          authError('Cannot update ' + user.username + ' password', error),
        ),
      )
  }
}

export function resetPassword(password, token) {
  return dispatch => {
    dispatch({
      type: PASSWORD_RESET,
      payload: {},
    })

    const url = window.location.origin
    createArchivist(dispatch, url)
    archivistPost(
      dispatch,
      '/api/v1/reset-password',
      { password },
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // disable browser auth
          'X-Archivist-Recovery-Token': token,
        },
      },
    )
      .then(response => {
        authorize(dispatch, response.data)
        dispatch({
          type: PASSWORD_RESET_SUCCESS,
          payload: {},
        })
      })
      .catch(error => {
        const { response } = error
        if (response && response.data)
          dispatch({
            type: PASSWORD_RESET_ERROR,
            payload: response.data,
          })
        dispatch(authError('Cannot reset password', error))
      })
      .catch(error => dispatch(authError('Cannot reset password', error)))
  }
}

export function signoutUser(user, origin) {
  return dispatch => {
    if (archivist) {
      archivistPost(
        dispatch,
        '/api/v1/logout',
        {},
        {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }, // disable browser auth
        },
      )
        .then(response => {
          dispatch({ type: UNAUTH_USER, payload: response.data })
          dispatch({
            type: AUTH_DEFAULTS,
            payload: { origin, username: user.username },
          })
          localStorage.setItem(
            USER_ITEM,
            JSON.stringify(new User({ ...user, id: -1 })),
          )
        })
        .catch(error => dispatch(authError('Cannot signout', error)))
    } else {
      dispatch({ type: UNAUTH_USER, payload: {} })
      localStorage.setItem(
        USER_ITEM,
        JSON.stringify(new User({ ...user, id: -1 })),
      )
    }
  }
}

export function authError(msg, error) {
  let payload
  if (msg && error) {
    const message = error.message
      ? error.message
      : error.response && error.response.data
        ? error.response.data.message
        : 'Unknown error'
    payload = msg + ': ' + message
  }
  return {
    type: AUTH_ERROR,
    payload,
  }
}

export function clearAuthError() {
  return {
    type: CLEAR_AUTH_ERROR,
    payload: undefined,
  }
}

export function getUserPermissions(user) {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/users/' + user.id + '/permissions')
      .then(response => {
        dispatch({
          type: AUTH_PERMISSIONS,
          payload: response.data.map(json => new Permission(json)),
        })
      })
      .catch(error => {
        console.error('Cannot get user permissions ' + error)
      })
  }
}

export function saveUserSettings(user, metadata) {
  return dispatch => {
    // FIXME: Move search to settings.search in server?
    // FIXME: Use localStore rather than server?
    const settings = { metadata }
    return archivistPut(
      dispatch,
      '/api/v1/users/' + user.id + '/_settings',
      settings,
    )
      .then(response => {
        dispatch({ type: USER_SETTINGS, payload: { user, metadata } })
      })
      .catch(error => {
        console.error('Cannot save user settings ' + error)
      })
  }
}

export function getHMACKey() {
  return dispatch => {
    return archivistGet(dispatch, '/api/v1/api-key')
      .then(response => {
        dispatch({ type: AUTH_HMAC, payload: response.data })
        console.log('Got hmac key: ' + response.data)
      })
      .catch(error => {
        console.error('Cannot get HMAC key: ' + error)
      })
  }
}

export function getServerRootPath() {
  return dispatch => {
    return archivistGet(dispatch, 'api/v1/settings/archivist.lfs.paths').then(
      response => {
        // Note: dispatch is stubbed here
        // for consistency, and because  archivistGet() needs a dispatcher
        // but this action has no reducer
        dispatch({ type: GET_SERVER_DEFAULT_PATH, payload: response.data })
        // Return the payload, for use in promises
        return response.data
      },
    )
  }
}

export function listServerImportFiles(path) {
  return dispatch => {
    return archivistPost(dispatch, 'api/v1/lfs', { path }).then(response => {
      // Note: dispatch is stubbed here
      // for consistency, and because  archivistPose() needs a dispatcher
      // but this action has no reducer
      dispatch({ type: LIST_SERVER_IMPORT_FILES, payload: response.data })
      // Return the payload, for use in promises
      return response.data
    })
  }
}

export function samlOptionsRequest() {
  return dispatch => {
    dispatch({ type: SAML_OPTIONS_REQUEST, payload: {} })
    saml
      .getOptions()
      .then(response => {
        dispatch({ type: SAML_OPTIONS_REQUEST_SUCCESS, payload: response })
      })
      .catch(error => {
        console.error('Can not fetch SAML options', JSON.stringify(error))
        dispatch({ type: SAML_OPTIONS_REQUEST_ERROR, payload: {} })
      })
  }
}

export function checkSession() {
  return {
    type: SESSION_TIMEOUT,
    payload: true,
  }
}
