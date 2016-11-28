import axios from 'axios'
import { browserHistory } from 'react-router'
import { AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR } from '../constants/actionTypes'
import { USER_ITEM, HOST_ITEM, PROTOCOL_ITEM } from '../constants/localStorageItems'

import User from '../models/User'

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
    // Set the user state for the login form, but authenticated=false if user.id < 0
    dispatch({type: AUTH_USER, payload: user})

    // Create a new archivist, if needed for a new host
    createArchivist(dispatch, protocol, host)
    if (user.id > 0) {
      archivist.get('/api/v1/users/' + user.id)
        .then(response => {
          const user = new User(response.data)
          dispatch({type: AUTH_USER, payload: user})
          localStorage.setItem(USER_ITEM, JSON.stringify(user))
          browserHistory.push('/')
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            dispatch({type: UNAUTH_USER, payload: error.response.data})
          } else {
            dispatch(authError('Cannot validate user ' + user.username + ': ' + error))
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
        const user = new User(response.data)
        dispatch({ type: AUTH_USER, payload: user })
        localStorage.setItem(USER_ITEM, JSON.stringify(user))
        browserHistory.push('/')
      })
      .catch(error => dispatch(authError('Bad Login Info: ' + error)))
  }
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

export function signoutUser (user) {
  return dispatch => {
    archivist.post('/api/v1/logout')
      .then(response => {
        dispatch({ type: UNAUTH_USER, payload: response.data })
        localStorage.setItem(USER_ITEM, JSON.stringify(new User({...user, id: -1})))
      })
      .catch(error => dispatch(authError(error)))
  }
}

export function authError (error) {
  return {
    type: AUTH_ERROR,
    payload: error
  }
}
