import authReducer from './authReducer'
import User from '../models/User'
import { AUTH_USER, UNAUTH_USER, AUTH_HOST, AUTH_ERROR } from '../constants/actionTypes'

describe('authReducer', () => {
  it('AUTH_USER sets authenticated', () => {
    const user = new User({ id: 1, username: 'Bob', email: 'bob@foo.com', firstName: 'Bob', lastName: 'Robert' })
    expect(authReducer([], { type: AUTH_USER, payload: user }))
      .toEqual({ error: '', authenticated: true, user })
  })

  it('UNAUTH_USER clears authenticated', () => {
    expect(authReducer([], { type: UNAUTH_USER }))
      .toEqual({ authenticated: false })
  })

  it('AUTH_HOST sets host', () => {
    expect(authReducer([], { type: AUTH_HOST, payload: 'localhost' }))
      .toEqual({ host: 'localhost' })
  })

  it('AUTH_ERROR sets message', () => {
    const errmsg = 'bad bits'
    expect(authReducer([], { type: AUTH_ERROR, payload: errmsg }))
      .toEqual({ error: errmsg })
  })
})
