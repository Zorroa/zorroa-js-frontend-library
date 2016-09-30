import authReducer from './authReducer'
import { AUTH_USER, UNAUTH_USER, AUTH_ERROR } from '../constants/actionTypes'

describe('authReducer', () => {
  it('AUTH_USER sets authenticated', () => {
    expect(authReducer([], { type: AUTH_USER }))
      .toEqual({ error: '', authenticated: true })
  })

  it('UNAUTH_USER clears authenticated', () => {
    expect(authReducer([], { type: UNAUTH_USER }))
      .toEqual({ authenticated: false })
  })

  it('AUTH_ERROR sets message', () => {
    const errmsg = 'bad bits'
    expect(authReducer([], { type: AUTH_ERROR, payload: errmsg }))
      .toEqual({ error: errmsg })
  })
})
