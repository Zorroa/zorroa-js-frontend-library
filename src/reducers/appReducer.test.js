import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, METADATA_FIELDS, TABLE_FIELDS } from '../constants/actionTypes'
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

  describe('SIDEBAR', () => {
    it('left sidebar iconified', () => {
      const action = { type: ICONIFY_LEFT_SIDEBAR, payload: true }
      expect(appReducer({}, action)
      ).toEqual({ leftSidebarIsIconified: true })
    })

    it('right sidebar iconified', () => {
      const action = { type: ICONIFY_RIGHT_SIDEBAR, payload: true }
      expect(appReducer({}, action)
      ).toEqual({ rightSidebarIsIconified: true })
    })
  })

  describe('FIELDS', () => {
    it('set metadata fields', () => {
      const fields = [ 'some.important.thing' ]
      const action = { type: METADATA_FIELDS, payload: fields }
      expect(appReducer({}, action)
      ).toEqual({ metadataFields: fields })
    })

    it('set table fields', () => {
      const fields = [ 'some.important.thing' ]
      const action = { type: TABLE_FIELDS, payload: fields }
      expect(appReducer({}, action)
      ).toEqual({ tableFields: fields })
    })
  })
})
