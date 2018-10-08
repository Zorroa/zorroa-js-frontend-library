import { SET_DARK_MODE } from '../constants/actionTypes'
import appReducer from './appReducer'

describe('appReducer', () => {
  describe(SET_DARK_MODE, () => {
    it('Should set the dark mode option to false', () => {
      const action = { type: SET_DARK_MODE, payload: false }
      expect(appReducer({}, action)).toEqual({ isDarkMode: false })
    })

    it('Should set the dark mode option to true', () => {
      const action = { type: SET_DARK_MODE, payload: true }
      expect(appReducer({}, action)).toEqual({ isDarkMode: true })
    })
  })
})
