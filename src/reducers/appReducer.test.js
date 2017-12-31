import {
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, SET_DRAGGING
} from '../constants/actionTypes'
import appReducer from './appReducer'

describe('appReducer', () => {
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

    it('TOGGLE_COLLAPSIBLE should set collapsibleOpen', () => {
      const collapsibleName = 'foo'
      const isOpen = true
      const payload = { collapsibleName, isOpen }
      expect(appReducer({}, { type: TOGGLE_COLLAPSIBLE, payload }))
        .toEqual({ collapsibleOpen: {[collapsibleName]: isOpen} })
    })
  })

  describe('FIELDS', () => {
    it('set metadata fields', () => {
      const fields = [ 'some.important.thing' ]
      const action = { type: METADATA_FIELDS, payload: fields }
      expect(appReducer({}, action))
      .toEqual({ metadataFields: fields })
    })
  })

  describe('DRAGDROP', () => {
    it('set DnD dragging on', () => {
      const dragAction = { type: SET_DRAGGING, payload: true }
      expect(appReducer({}, dragAction)).toEqual({ dragInfo: true })
      const dropAction = { type: SET_DRAGGING, payload: false }
      expect(appReducer({}, dropAction)).toEqual({ dragInfo: false })
    })
  })
})
