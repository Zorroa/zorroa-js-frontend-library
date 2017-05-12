import axios from 'axios'
import { browserHistory } from 'react-router'
import * as api from '../globals/api.js'

import {
  AUTH_USER, UNAUTH_USER, AUTH_ORIGIN, AUTH_ERROR, USER_SETTINGS,
  AUTH_PERMISSIONS, AUTH_SYNC, METADATA_FIELDS, AUTH_ONBOARDING, AUTH_HMAC,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT, SET_TABLE_FIELD_WIDTH,
  SHOW_MULTIPAGE, VIDEO_VOLUME, AUTH_CHANGE_PASSWORD, AUTH_DEFAULTS, LIGHTBAR_FIELDS
} from '../constants/actionTypes'
import { USER_ITEM, ORIGIN_ITEM } from '../constants/localStorageItems'
import User from '../models/User'
import Permission from '../models/Permission'

// Global variable to hold axios connection
// FIXME: Should this be state?
var archivist

// Create the global axios connection, on login or refresh.
// Note this is not an action creator, so it should probably
// be in another file, but we need access to archivist global.
export function createArchivist (dispatch, origin) {
  // Override origin in production or update if not set
  if (PROD || !origin || !origin.length) {
    origin = window.location.origin
  }
  if (!archivist || archivist.origin !== origin) {
    // Use withCredentials to handle CORS certification.
    archivist = axios.create({baseURL: origin, withCredentials: true})
  }
  dispatch({ type: AUTH_ORIGIN, payload: origin })
  localStorage.setItem(ORIGIN_ITEM, origin)
}

// // Return the axios connection for other action creators
// export function getArchivist () {
//   return archivist
// }

function startRequest (dispatch) {
  if (api.getRequestsSynced()) {
    requestAnimationFrame(_ => dispatch({ type: AUTH_SYNC, payload: false }))
  }
  api.incRequestSentCounter()
}

function finishRequest (dispatch, requestProm) {
  return requestProm
  .then(response => {
    requestAnimationFrame(_ => {
      api.incRequestReceivedCounter()
      if (api.getRequestsSynced()) dispatch({ type: AUTH_SYNC, payload: true })
    })
    return response
  }, error => {
    requestAnimationFrame(_ => {
      api.incRequestReceivedCounter()
      if (api.getRequestsSynced()) dispatch({ type: AUTH_SYNC, payload: true })
    })
    return Promise.reject(error)
  })
}

export function archivistGet (dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.get.apply(this, args))
}

export function archivistPost (dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.post.apply(this, args))
}

export function archivistPut (dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.put.apply(this, args))
}

export function archivistRequest (dispatch, ...args) {
  if (!archivist) return Promise.resolve()
  startRequest(dispatch)
  return finishRequest(dispatch, archivist.apply(this, args))
}

export function archivistBaseURL () {
  return archivist && archivist.defaults.baseURL
}

export function validateUser (user, origin) {
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, origin)
    if (user.id > 0) {
      archivistGet(dispatch, '/api/v1/users/' + user.id, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' } // disable browser auth
      })
        .then(response => {
          authorize(dispatch, response.data)
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            dispatch({type: UNAUTH_USER, payload: error.response.data})
          } else {
            browserHistory.push('/signin')
          }
        })
    }
  }
}

export function signinDefaults (username, origin) {
  return ({
    type: AUTH_DEFAULTS,
    payload: {username, origin}
  })
}

export function signinUser (username, password, origin) {
  // Submit username+password to server
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, origin)
    archivistPost(dispatch, '/api/v1/login', {}, {
      withCredentials: true,
      auth: { username, password },
      headers: { 'X-Requested-With': 'XMLHttpRequest' } // disable browser auth
    })
      .then(response => {
        authorize(dispatch, response.data)
      })
      .catch(error => dispatch(authError('Bad Login Info', error)))
  }
}

function authorize (dispatch, json, source) {
  const user = new User(json)
  dispatch({ type: AUTH_USER, payload: user })
  localStorage.setItem(USER_ITEM, JSON.stringify(user))
  const metadata = json.settings && json.settings.metadata
  // ignore all UI settings when selenium testing
  if (metadata && !api.getSeleniumTesting()) {
    dispatch({type: USER_SETTINGS, payload: {user, metadata}})
    // FIXME: Should move to settings.search in server?
    /* FIXME: Disable restoring the search due to user conflicts.
    if (metadata.search) {
      const query = new AssetSearch(metadata.search)
      dispatch(restoreSearch(query))
    }
    */
    if (metadata.metadataFields || metadata.tableFields) {
      const fields = new Set()
      if (metadata.metadataFields) metadata.metadataFields.forEach(f => fields.add(f))
      if (metadata.tableFields) metadata.tableFields.forEach(f => fields.add(f))
      const payload = [...fields]
      dispatch({type: METADATA_FIELDS, payload})
    }
    if (metadata.thumbSize) {
      dispatch({type: THUMB_SIZE, payload: metadata.thumbSize})
    }
    if (metadata.thumbLayout) {
      dispatch({type: THUMB_LAYOUT, payload: metadata.thumbLayout})
    }
    if (metadata.showTable) {
      dispatch({type: SHOW_TABLE, payload: metadata.showTable})
    }
    if (metadata.tableHeight) {
      dispatch({type: TABLE_HEIGHT, payload: metadata.tableHeight})
    }
    if (metadata.showMultipage) {
      dispatch({type: SHOW_MULTIPAGE, payload: metadata.showMultipage})
    }
    if (metadata.videoVolume) {
      dispatch({type: VIDEO_VOLUME, payload: metadata.videoVolume})
    }
    if (metadata.tableFieldWidths) {
      dispatch({type: SET_TABLE_FIELD_WIDTH, payload: metadata.tableFieldWidths})
    }
    if (metadata.lightbarFields) {
      dispatch({type: LIGHTBAR_FIELDS, payload: metadata.lightbarFields})
    }
  }
  const url = source && source.length ? '?source=' + source : ''
  browserHistory.push(url)   // Retain search from original URL
}

export function forgotPassword (email, origin) {
  return dispatch => {
    const url = PROD ? origin : origin.replace('localhost:8080', 'localhost:8066')
    createArchivist(dispatch, url)
    archivistPost(dispatch, '/api/v1/send-password-reset-email', {email}, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' } // disable browser auth
    })
      .then(response => {
        dispatch({ type: UNAUTH_USER, payload: response.data })
        browserHistory.push('/signin')
      })
      .catch(error => dispatch(authError('Cannot reset ' + email, error)))
  }
}

export function changePassword (state) {
  return {
    type: AUTH_CHANGE_PASSWORD,
    payload: state
  }
}

export function updatePassword (user, password) {
  return dispatch => {
    user = new User({ ...user, password })
    archivistPut(dispatch, '/api/v1/users/' + user.id, user, {
      headers: {'X-Requested-With': 'XMLHttpRequest'} // disable browser auth
    })
      .then(response => {
        dispatch({ type: AUTH_CHANGE_PASSWORD, payload: false })
        dispatch({ type: AUTH_ONBOARDING, payload: false })
      })
      .catch(error => dispatch(authError('Cannot update ' + user.username + ' password', error)))
  }
}

export function resetPassword (password, token, origin, source) {
  return dispatch => {
    const url = PROD ? origin : origin.replace('localhost:8080', 'localhost:8066')
    createArchivist(dispatch, url)
    archivistPost(dispatch, '/api/v1/reset-password', {password}, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',   // disable browser auth
        'X-Archivist-Recovery-Token': token
      }
    })
      .then(response => {
        authorize(dispatch, response.data, source)
        const onboarding = source && source.length > 0
        dispatch({ type: AUTH_ONBOARDING, payload: onboarding })
      })
      .catch(error => dispatch(authError('Cannot reset password', error)))
  }
}

export function signoutUser (user, origin) {
  return dispatch => {
    if (archivist) {
      archivistPost(dispatch, '/api/v1/logout', {}, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' } // disable browser auth
      })
      .then(response => {
        dispatch({ type: UNAUTH_USER, payload: response.data })
        dispatch({ type: AUTH_DEFAULTS, payload: {origin, username: user.username} })
        localStorage.setItem(USER_ITEM, JSON.stringify(new User({...user, id: -1})))
      })
      .catch(error => dispatch(authError('Cannot signout', error)))
    } else {
      dispatch({ type: UNAUTH_USER, payload: {} })
      localStorage.setItem(USER_ITEM, JSON.stringify(new User({...user, id: -1})))
    }
  }
}

export function authError (msg, error) {
  let payload
  if (msg && error) {
    const message = error.message ? error.message : (error.response && error.response.data ? error.response.data.message : 'Unknown error')
    payload = msg + ': ' + message
  }
  return {
    type: AUTH_ERROR,
    payload
  }
}

export function getUserPermissions (user) {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/users/' + user.id + '/permissions')
      .then(response => {
        dispatch({ type: AUTH_PERMISSIONS, payload: response.data.map(json => (new Permission(json))) })
      })
      .catch(error => {
        console.error('Cannot get user permissions ' + error)
      })
  }
}

export function saveUserSettings (user, metadata) {
  return dispatch => {
    // FIXME: Move search to settings.search in server?
    // FIXME: Use localStore rather than server?
    const settings = { metadata }
    archivistPut(dispatch, '/api/v1/users/' + user.id + '/_settings', settings)
      .then(response => {
        dispatch({ type: USER_SETTINGS, payload: { user, metadata } })
        console.log('Save user settings')
      })
      .catch(error => {
        console.error('Cannot save user settings ' + error)
      })
  }
}

export function getHMACKey () {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/api-key')
      .then(response => {
        dispatch({ type: AUTH_HMAC, payload: response.data })
        console.log('Got hmac key: ' + response.data)
      })
      .catch(error => {
        console.error('Cannot get HMAC key: ' + error)
      })
  }
}
