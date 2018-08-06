import * as types from '../constants/actionTypes'
import * as actions from './authAction'

describe('authActions', () => {
  describe('authActionSync', () => {
    it('should generate an error message', () => {
      const error = { message: 'oh oh' }
      const errmsg = 'something bad'
      const expectedAction = {
        type: types.AUTH_ERROR,
        payload: errmsg + ': ' + error.message,
      }
      expect(actions.authError(errmsg, error)).toEqual(expectedAction)
    })
  })
})
