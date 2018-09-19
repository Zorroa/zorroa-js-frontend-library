import {
  RENDER_TABLE_CONTEXT_MENU,
  RENDER_THUMB_CONTEXT_MENU,
  RENDER_META_CONTEXT_MENU,
  DISMISS_TABLE_CONTEXT_MENU,
  DISMISS_THUMB_CONTEXT_MENU,
  DISMISS_META_CONTEXT_MENU,
} from '../constants/actionTypes'
import contextMenuReducer from './contextMenuReducer'

describe('contextMenuReducer', () => {
  describe(RENDER_TABLE_CONTEXT_MENU, () => {
    it(`Should set showTableCtxtMenu to true,
        set contextMenuPos, and selectedFieldIndex`, () => {
      const action = {
        type: RENDER_TABLE_CONTEXT_MENU,
        payload: {
          selectedFieldIndex: 1,
          contextMenuPos: { x: 10, y: 10 },
          show: true,
        },
      }
      expect(contextMenuReducer({}, action)).toEqual({
        showTableCtxtMenu: true,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 10, y: 10 },
        selectedFieldIndex: 1,
      })
    })
  })

  describe(RENDER_THUMB_CONTEXT_MENU, () => {
    it(`Should set showThumbCtxtMenu to true and
        set contextMenuPos`, () => {
      const action = {
        type: RENDER_THUMB_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 10, y: 10 },
          show: true,
        },
      }
      expect(contextMenuReducer({}, action)).toEqual({
        showTableCtxtMenu: false,
        showThumbCtxtMenu: true,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 10, y: 10 },
      })
    })
  })

  describe(RENDER_META_CONTEXT_MENU, () => {
    it(`Should set showMetaCtxtMenu to true and
        set contextMenuPos`, () => {
      const action = {
        type: RENDER_META_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 10, y: 10 },
          show: true,
        },
      }
      expect(contextMenuReducer({}, action)).toEqual({
        showTableCtxtMenu: false,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: true,
        contextMenuPos: { x: 10, y: 10 },
      })
    })
  })

  describe(DISMISS_TABLE_CONTEXT_MENU, () => {
    it(`Should set showTableCtxtMenu to false,
        reset contextMenuPos`, () => {
      const action = {
        type: DISMISS_TABLE_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 0, y: 0 },
          show: false,
        },
      }
      const state = {
        showTableCtxtMenu: true,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 10, y: 10 },
      }
      expect(contextMenuReducer(state, action)).toEqual({
        showTableCtxtMenu: false,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 0, y: 0 },
      })
    })
  })

  describe(DISMISS_THUMB_CONTEXT_MENU, () => {
    it(`Should set showThumbCtxtMenu to false,
        reset contextMenuPos`, () => {
      const action = {
        type: DISMISS_THUMB_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 0, y: 0 },
          show: false,
        },
      }
      const state = {
        showTableCtxtMenu: false,
        showThumbCtxtMenu: true,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 10, y: 10 },
      }
      expect(contextMenuReducer(state, action)).toEqual({
        showTableCtxtMenu: false,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 0, y: 0 },
      })
    })
  })

  describe(DISMISS_META_CONTEXT_MENU, () => {
    it(`Should set showMetaCtxtMenu to false,
        reset contextMenuPos`, () => {
      const action = {
        type: DISMISS_META_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 0, y: 0 },
          show: false,
        },
      }
      const state = {
        showTableCtxtMenu: false,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: true,
        contextMenuPos: { x: 10, y: 10 },
      }
      expect(contextMenuReducer(state, action)).toEqual({
        showTableCtxtMenu: false,
        showThumbCtxtMenu: false,
        showMetaCtxtMenu: false,
        contextMenuPos: { x: 0, y: 0 },
      })
    })
  })
})
