import { MODAL } from '../constants/actionTypes'
import appReducer from './appReducer'

describe('appReducer', () => {
  describe(`${MODAL}`, () => {
    it('should update the modal state', () => {
      const action = {
        type: MODAL,
        payload: {
          title: 'Test',
          footer: 'footer stuff',
          content: 'Blar Plop'
        }
      }

      expect(
        appReducer({}, action)
      ).toEqual({ 'modal': action.payload })
    })

    it('should be an empty object when reset', () => {
      const action = { type: MODAL, payload: {} }
      expect(
        appReducer({}, action)
      ).toEqual({ 'modal': {} })
    })
  })
})
