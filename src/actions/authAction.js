import axios from 'axios'
import { browserHistory } from 'react-router'
import { initialize } from 'redux-form'

import {
  AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR,
  AUTH_PERMISSIONS, METADATA_FIELDS, TABLE_FIELDS } from '../constants/actionTypes'
import { USER_ITEM, HOST_ITEM, PROTOCOL_ITEM } from '../constants/localStorageItems'
import User from '../models/User'
import Permission from '../models/Permission'
import AssetSearch from '../models/AssetSearch'
import { restoreSearch } from './racetrackAction'
import * as api from '../globals/api.js'

// Global variable to hold axios connection
// FIXME: Should this be state?
var archivist

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

// Return the axios connection for other action creators
export function getArchivist () {
  return archivist
}

export function validateUser (user, protocol, host) {
  return dispatch => {
    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, protocol, host)
    if (user.id > 0) {
      archivist.get('/api/v1/users/' + user.id)
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
    archivist.post('/api/v1/login', {}, {
      withCredentials: true,
      auth: { username, password }
    })
      .then(response => {
        authorize(dispatch, response.data)
      })
      .catch(error => dispatch(authError('Bad Login Info: ' + error)))
  }
}

function authorize (dispatch, json) {
  const metadata = json.settings && json.settings.metadata
  if (metadata) {
    // FIXME: Should move to settings.search in server?
    if (metadata.search && !api.getSeleniumTesting()) {
      const query = new AssetSearch(metadata.search)
      dispatch(restoreSearch(query))
    }
    if (metadata.metadataFields) {
      dispatch({type: METADATA_FIELDS, payload: metadata.metadataFields})
    }
    if (metadata.tableFields) {
      dispatch({type: TABLE_FIELDS, payload: metadata.tableFields})
    }
  }
  const user = new User(json)
  dispatch({ type: AUTH_USER, payload: user })
  localStorage.setItem(USER_ITEM, JSON.stringify(user))
  browserHistory.push('/')
}

export function signupUser ({ username, password }) {
  return dispatch => {
    archivist.post('/signup', {}, { username, password })
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
      archivist.post('/api/v1/logout')
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
    archivist.get('/api/v1/users/' + user.id + '/permissions')
      .then(response => {
        dispatch({ type: AUTH_PERMISSIONS, payload: response.data.map(json => (new Permission(json))) })
      })
      .catch(error => {
        console.error('Cannot get user permissions ' + error)
      })
  }
}

export function saveUserSettings (user, metadataFields, tableFields, search) {
  return dispatch => {
    // FIXME: Move search to settings.search in server?
    const metadata = { metadataFields, tableFields, search }
    const settings = { metadata }
    archivist.put('/api/v1/users/' + user.id + '/_settings', settings)
      .then(response => {
        console.log('Save user settings')
      })
      .catch(error => {
        console.error('Cannot save user settings ' + error)
      })
  }
}
