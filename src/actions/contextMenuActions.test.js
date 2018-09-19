import {
  showTableContextMenu,
  dismissTableContextMenu,
  showThumbContextMenu,
  dismissThumbContextMenu,
  showMetaContextMenu,
  dismissMetaContextMenu,
} from './contextMenuActions'
import {
  RENDER_TABLE_CONTEXT_MENU,
  RENDER_THUMB_CONTEXT_MENU,
  RENDER_META_CONTEXT_MENU,
  DISMISS_TABLE_CONTEXT_MENU,
  DISMISS_THUMB_CONTEXT_MENU,
  DISMISS_META_CONTEXT_MENU,
} from '../constants/actionTypes'

describe('contextMenuActions', () => {
  describe('showTableContextMenu()', () => {
    it('Should show TableContextMenu', () => {
      const expectedAction = {
        type: RENDER_TABLE_CONTEXT_MENU,
        payload: {
          selectedFieldIndex: 1,
          contextMenuPos: { x: 0, y: 0 },
          show: true,
        },
      }
      expect(showTableContextMenu({ x: 0, y: 0 }, 1)).toEqual(expectedAction)
    })
  })

  describe('dismissTableContextMenu()', () => {
    it('Should hide TableContextMenu', () => {
      const expectedAction = {
        type: DISMISS_TABLE_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 0, y: 0 },
          show: false,
        },
      }
      expect(dismissTableContextMenu()).toEqual(expectedAction)
    })
  })

  describe('showThumbContextMenu()', () => {
    it('Should show ThumbContextMenu', () => {
      const expectedAction = {
        type: RENDER_THUMB_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 10, y: 10 },
          show: true,
        },
      }
      expect(
        showThumbContextMenu({
          x: 10,
          y: 10,
        }),
      ).toEqual(expectedAction)
    })
  })

  describe('dismissThumbContextMenu()', () => {
    it('Should hide ThumbContextMenu', () => {
      const expectedAction = {
        type: DISMISS_THUMB_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 0, y: 0 },
          show: false,
        },
      }
      expect(dismissThumbContextMenu()).toEqual(expectedAction)
    })
  })

  describe('showMetaContextMenu()', () => {
    it('Should show MetaContextMenu', () => {
      const expectedAction = {
        type: RENDER_META_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 10, y: 10 },
          show: true,
        },
      }
      expect(
        showMetaContextMenu({
          x: 10,
          y: 10,
        }),
      ).toEqual(expectedAction)
    })
  })

  describe('dismissMetaContextMenu()', () => {
    it('Should hide MetaContextMenu', () => {
      const expectedAction = {
        type: DISMISS_META_CONTEXT_MENU,
        payload: {
          contextMenuPos: { x: 0, y: 0 },
          show: false,
        },
      }
      expect(dismissMetaContextMenu()).toEqual(expectedAction)
    })
  })
})
