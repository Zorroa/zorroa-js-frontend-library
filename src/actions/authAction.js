import axios from 'axios'
import { browserHistory } from 'react-router'
import { initialize } from 'redux-form'
import * as api from '../globals/api.js'

import {
  AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR, USER_SETTINGS,
  AUTH_PERMISSIONS, AUTH_SYNC, METADATA_FIELDS,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT, SET_TABLE_FIELD_WIDTH,
  SHOW_MULTIPAGE, VIDEO_VOLUME, PAGE_SIZE
} from '../constants/actionTypes'
import { USER_ITEM, HOST_ITEM, PROTOCOL_ITEM } from '../constants/localStorageItems'
import User from '../models/User'
import Permission from '../models/Permission'

// Global variable to hold axios connection
// FIXME: Should this be state?
var archivist
var requestSentCounter = 0
var requestReceivedCounter = 0

// Create the global axios connection, on login or refresh.
// Note this is not an action creator, so it should probably
// be in another file, but we need access to archivist global.
export function createArchivist (dispatch, protocol, host) {
  // Set the default protocol for development.
  // Change or provide a UI to set it for development testing.
  if (!protocol) {
    protocol = 'http:'
  }
  if (!host || PROD) {
    host = window.location.hostname
    protocol = window.location.protocol
  }
  const baseURL = protocol + '//' + host + ':8066'
  if (!archivist || archivist.baseURL !== baseURL) {
    // Use withCredentials to handle CORS certification.
    archivist = axios.create({baseURL, withCredentials: true})
  }
  dispatch({ type: AUTH_HOST, payload: {host, protocol} })
  localStorage.setItem(HOST_ITEM, host)
  localStorage.setItem(PROTOCOL_ITEM, protocol)
}

// // Return the axios connection for other action creators
// export function getArchivist () {
//   return archivist
// }

function startRequest (dispatch) {
  if (requestReceivedCounter === requestSentCounter) {
    dispatch({ type: AUTH_SYNC, payload: false })
  }
  requestSentCounter++
}

function finishRequest (dispatch, requestProm) {
  return requestProm
  .then(response => {
    requestReceivedCounter++
    if (requestReceivedCounter === requestSentCounter) {
      dispatch({ type: AUTH_SYNC, payload: true })
    }
    return response
  }, error => {
    requestReceivedCounter++
    if (requestReceivedCounter === requestSentCounter) {
      dispatch({ type: AUTH_SYNC, payload: true })
    }
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

export function validateUser (user, protocol, host) {
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, protocol, host)
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
            dispatch(authError('Cannot validate user ' + user.username + ': ' + error))
            browserHistory.push('/signin')
          }
        })
    }
  }
}

export function signinUser ({ username, password, protocol, host }) {
  // Submit username+password to server
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, protocol, host)
    archivistPost(dispatch, '/api/v1/login', {}, {
      withCredentials: true,
      auth: { username, password },
      headers: { 'X-Requested-With': 'XMLHttpRequest' } // disable browser auth
    })
      .then(response => {
        authorize(dispatch, response.data)
      })
      .catch(error => dispatch(authError('Bad Login Info: ' + error)))
  }
}

function authorize (dispatch, json) {
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
      const payload = metadata.metadataFields
      if (metadata.tableFields) payload.push(...metadata.tableFields)
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
    if (metadata.pageSize) {
      dispatch({type: PAGE_SIZE, payload: metadata.pageSize})
    }
    if (metadata.tableFieldWidths) {
      dispatch({type: SET_TABLE_FIELD_WIDTH, payload: metadata.tableFieldWidths})
    }
  }
  browserHistory.push('/')
}

export function signupUser ({ username, password }) {
  return dispatch => {
    archivistPost(dispatch, '/signup', {}, { username, password })
      .then(response => {
        const user = User(response.data)
        dispatch({ type: AUTH_USER, payload: user })
        localStorage.setItem(USER_ITEM, JSON.stringify(user))
        browserHistory.push('/')
      })
      .catch(error => dispatch(authError('Cannot signin: ' + error)))
  }
}

export function signoutUser (user, host) {
  return dispatch => {
    if (archivist) {
      archivistPost(dispatch, '/api/v1/logout', {}, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' } // disable browser auth
      })
      .then(response => {
        dispatch({ type: UNAUTH_USER, payload: response.data })
        dispatch(initialize('signin', {host, username: user.username, ssl: true}))
        localStorage.setItem(USER_ITEM, JSON.stringify(new User({...user, id: -1})))
      })
      .catch(error => dispatch(authError(error)))
    } else {
      dispatch({ type: UNAUTH_USER, payload: {} })
      localStorage.setItem(USER_ITEM, JSON.stringify(new User({...user, id: -1})))
    }
  }
}

export function authError (error) {
  return {
    type: AUTH_ERROR,
    payload: error
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
