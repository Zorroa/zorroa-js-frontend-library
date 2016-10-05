import axios from 'axios'
import { browserHistory } from 'react-router'
import { AUTH_USER, UNAUTH_USER, AUTH_ERROR } from '../constants/actionTypes'
import { USER_ITEM } from '../constants/localStorageItems'

import User from '../models/User'

const baseURL = 'https://' + window.location.hostname + ':8066'
const archivist = axios.create({ baseURL })

export function signinUser ({ username, password }) {
  // Submit username+password to server
  return dispatch => {
    archivist.post('/api/v1/login', {}, {
      withCredentials: true,
      auth: { username, password }
    })
      .then(response => {
        const user = new User(response.data)
        dispatch({ type: AUTH_USER, payload: user })
        localStorage.setItem(USER_ITEM, user)
        browserHistory.push('/')
      })
      .catch((error) => {
        dispatch(authError('Bad Login Info'))
      })
  }
}

export function signupUser ({ username, password }) {
  return dispatch => {
    archivist.post('/signup', {}, { username, password })
      .then(response => {
        const user = User(response.data)
        dispatch({ type: AUTH_USER, payload: user })
        localStorage.setItem(USER_ITEM, user)
        browserHistory.push('/')
      })
      .catch(error => dispatch(authError(error.response.data.error)))
  }
}

export function signoutUser () {
  archivist.post('/logout', {}, {})
  localStorage.removeItem(USER_ITEM)
  return { type: UNAUTH_USER }
}

export function authError (error) {
  return {
    type: AUTH_ERROR,
    payload: error
  }
}
