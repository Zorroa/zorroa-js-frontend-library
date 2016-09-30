import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import * as types from '../constants/actionTypes'
import * as actions from './authAction'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('authActions', () => {
  const email = 'foo@bar.com'
  const password = 'foobar'
  const payload = { email, password }
  const token = '9017140nsada0814n'

  describe('authActionSync', () => {
    it('should generate an error message', () => {
      const errmsg = 'something bad'
      const expectedAction = {
        type: types.AUTH_ERROR,
        payload: errmsg
      }
      expect(actions.authError(errmsg)).toEqual(expectedAction)
    })
  })

  describe('authActionAsync', () => {
    afterEach(() => {
      nock.cleanAll()
    })

    xit('creates user after checking', () => {
      nock(`${process.env.ROOT_URL}`)
        .post('/signin', payload)
        .reply(200, { body: { token } })

      const expectedAction = {
        type: types.AUTH_USER,
        payload: {token}
      }
      const store = mockStore({})

      return store.dispatch(actions.signinUser(payload))
        .then(() => {
          expect(store.getActions()).toEqual(expectedAction)
        })
    })
  })
})
