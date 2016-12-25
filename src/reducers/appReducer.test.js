import {
  SHOW_DISPLAY_OPTIONS_MODAL, HIDE_DISPLAY_OPTIONS_MODAL,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, TABLE_FIELDS, SET_TABLE_FIELD_WIDTH, SET_DRAGGING
} from '../constants/actionTypes'
import appReducer, { defaultTableFields, defaultTableFieldWidth } from './appReducer'

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
      const tableFields = [ 'some.important.thing' ]
      const action = { type: TABLE_FIELDS, payload: tableFields }
      const tableFieldWidth = Object.assign({},
        ...tableFields.map(f => ({[f]: defaultTableFieldWidth})))
      expect(appReducer({}, action)
      ).toEqual({ tableFields, tableFieldWidth })
    })

    it('set table field widths', () => {
      // Test setting all default fields to non-default widths
      const tableFields = [ ...defaultTableFields ]
      const tableFieldWidth = Object.assign({},
        ...tableFields.map(f => ({[f]: 101})))
      const action = { type: SET_TABLE_FIELD_WIDTH, payload: tableFieldWidth }
      expect(appReducer({}, action))
      .toEqual({ tableFieldWidth })

      // Test overriding 2 fields with new widths & other fields should stay put
      const tableFields2 = [ defaultTableFields[0], 'some.important.thing' ]
      const tableFieldWidth2 = Object.assign({},
        ...tableFields2.map(f => ({[f]: 102})))
      const action2 = { type: SET_TABLE_FIELD_WIDTH, payload: tableFieldWidth2 }
      expect(appReducer({tableFieldWidth}, action2))
      .toEqual({ tableFieldWidth: { ...tableFieldWidth, ...tableFieldWidth2 } })
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
