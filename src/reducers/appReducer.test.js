import {
  SHOW_DISPLAY_OPTIONS_MODAL, HIDE_DISPLAY_OPTIONS_MODAL,
  SHOW_CREATE_FOLDER_MODAL, HIDE_CREATE_FOLDER_MODAL,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, TABLE_FIELDS, SET_DRAGGING
} from '../constants/actionTypes'
import appReducer from './appReducer'

describe('appReducer', () => {
  describe('Modals', () => {
    it('SHOW_DISPLAY_OPTIONS_MODAL should set displayOptions', () => {
      const payload = { bar: 'bam' }
      expect(appReducer({}, { type: SHOW_DISPLAY_OPTIONS_MODAL, payload }))
        .toEqual({ displayOptions: payload })
    })

    it('HIDE_DISPLAY_OPTIONS_MODAL should clear displayOptions', () => {
      const displayOptions = { bar: 'bam' }
      expect(appReducer({displayOptions}, { type: HIDE_DISPLAY_OPTIONS_MODAL, payload: null }))
        .toEqual({ displayOptions: null })
    })

    it('SHOW_CREATE_FOLDER_MODAL should set createFolder', () => {
      const payload = { bar: 'bam' }
      expect(appReducer({}, { type: SHOW_CREATE_FOLDER_MODAL, payload }))
        .toEqual({ createFolder: payload })
    })

    it('HIDE_CREATE_FOLDER_MODAL should clear createFolder', () => {
      const createFolder = { bar: 'bam' }
      expect(appReducer({createFolder}, { type: HIDE_CREATE_FOLDER_MODAL, payload: null }))
        .toEqual({ createFolder: null })
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

  describe('DRAGDROP', () => {
    it('set DnD dragging on', () => {
      const dragAction = { type: SET_DRAGGING, payload: true }
      expect(appReducer({}, dragAction)).toEqual({ isDragging: true })
      const dropAction = { type: SET_DRAGGING, payload: false }
      expect(appReducer({}, dropAction)).toEqual({ isDragging: false })
    })
  })
})
