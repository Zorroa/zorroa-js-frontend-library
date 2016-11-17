import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, METADATA_FIELDS, TABLE_FIELDS, DISPLAY_OPTIONS, SET_DRAGGING } from '../constants/actionTypes'
import appReducer from './appReducer'
import { METADATA_DISPLAY_OPTIONS } from '../actions/appActions'

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

  describe('DISPLAY_OPTIONS', () => {
    it('set display options', () => {
      const action = { type: DISPLAY_OPTIONS, payload: METADATA_DISPLAY_OPTIONS }
      expect(appReducer({}, action)
      ).toEqual({ displayOptions: METADATA_DISPLAY_OPTIONS })
    })
  })

  describe('DRAGDROP', () => {
    it('set DnD dragging on', () => {
      const dragAction = { type: SET_DRAGGING, payload: true }
      expect(appReducer({}, dragAction)).toEqual({ isDragging: true })
      const dropAction = { type: SET_DRAGGING, payload: false }
      expect(appReducer({}, dropAction)).toEqual({ isDragging: false })
    })
  })
})
