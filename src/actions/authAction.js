import axios from 'axios'
import { browserHistory } from 'react-router'
import { AUTH_USER, UNAUTH_USER, AUTH_ERROR, FETCH_MESSAGE } from '../constants/actionTypes'

export function signinUser ({ email, password }) {
  // Submit email+password to server
  return function (dispatch) {
    axios.post(`${process.env.ROOT_URL}/signin`, { email, password })
      .then(response => {
        // If request is good...
        // - Update state to indicate user is authenticated
        dispatch({ type: AUTH_USER, payload: response.data })
        // - Save the JWT token
        localStorage.setItem('token', response.data.token)
        // - Redirect to /feature
        browserHistory.push('/feature')
      })
      .catch(() => {
        // If request is bad...
        // - Show an error to the user
        dispatch(authError('Bad Login Info'))
      })
  }
}

export function signupUser ({ email, password }) {
  return function (dispatch) {
    axios.post(`${process.env.ROOT_URL}/signup`, { email, password })
      .then(response => {
        dispatch({ type: AUTH_USER, payload: response.data })
        localStorage.setItem('token', response.data.token)
        browserHistory.push('/feature')
      })
      .catch(error => dispatch(authError(error.response.data.error)))
  }
}

export function signoutUser () {
  localStorage.removeItem('token')
  return { type: UNAUTH_USER }
}

export function authError (error) {
  return {
    type: AUTH_ERROR,
    payload: error
  }
}

export function fetchMessage () {
  return function (dispatch) {
    axios.get(process.env.ROOT_URL, {
      headers: { authorization: localStorage.getItem('token') }
    })
      .then(response => {
        dispatch({
          type: FETCH_MESSAGE,
          payload: response.data.message
        })
      })
  }
}
