import authReducer from './authReducer'
import User from '../models/User'
import Permission from '../models/Permission'
import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ORIGIN,
  AUTH_ERROR,
  AUTH_PERMISSIONS,
  SAML_OPTIONS_REQUEST_SUCCESS,
  SAML_OPTIONS_REQUEST_ERROR,
} from '../constants/actionTypes'

describe('authReducer', () => {
  it('AUTH_USER sets authenticated', () => {
    const user = new User({
      id: '1',
      username: 'Bob',
      email: 'bob@foo.com',
      firstName: 'Bob',
      lastName: 'Robert',
    })
    expect(
      authReducer([], {
        type: AUTH_USER,
        payload: {
          user,
          source: 'local',
        },
      }),
    ).toEqual({
      error: '',
      authenticated: true,
      source: 'local',
      user,
    })
  })

  it('UNAUTH_USER clears authenticated', () => {
    expect(authReducer([], { type: UNAUTH_USER })).toEqual({
      authenticated: false,
    })
  })

  it('AUTH_HOST sets origin', () => {
    const payload = { origin: 'http://localhost:8066' }
    expect(
      authReducer([], { type: AUTH_ORIGIN, payload: 'http://localhost:8066' }),
    ).toEqual(payload)
  })

  it('AUTH_ERROR sets message', () => {
    const errmsg = 'bad bits'
    expect(authReducer([], { type: AUTH_ERROR, payload: errmsg })).toEqual({
      error: errmsg,
    })
  })

  it('AUTH_PERMISSIONS set user permissions', () => {
    const user = new User({ id: 5, name: 'joe' })
    const permissions = [new Permission({ id: 3, name: 'foo', type: 'bar' })]
    const outfitted = new User(user)
    outfitted.permissions = permissions
    expect(
      authReducer({ user }, { type: AUTH_PERMISSIONS, payload: permissions }),
    ).toEqual({
      user: outfitted,
      isAdministrator: false,
      isDeveloper: false,
      isManager: false,
      isSharer: false,
      isExporter: false,
      isLibrarian: false,
    })
  })

  it('SAML_OPTIONS_REQUEST_SUCCESS', () => {
    expect(
      authReducer(
        {},
        {
          type: SAML_OPTIONS_REQUEST_SUCCESS,
          payload: {
            logout: false,
            baseUrl: 'https://insight.stage1.ironmountainconnect.com',
            landing: 'https://insight.stage1.ironmountainconnect.com',
            discovery: true,
            proxyBase: true,
            idps: [
              '/saml/login?disco=true&idp=https://www.spogs1.ironmountainconnect.com/RMaaS',
            ],
          },
        },
      ),
    ).toEqual({
      samlUrl: 'https://www.spogs1.ironmountainconnect.com/RMaaS',
      shouldShowLogout: false,
      samlOptionsStatus: 'success',
    })
  })

  it('SAML_OPTIONS_REQUEST_ERROR', () => {
    expect(
      authReducer(
        {},
        {
          type: SAML_OPTIONS_REQUEST_ERROR,
          payload: {},
        },
      ),
    ).toEqual({
      samlUrl: '',
      shouldShowLogout: true,
      samlOptionsStatus: 'error',
    })
  })
})
