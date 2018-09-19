import {
  RENDER_TABLE_CONTEXT_MENU,
  RENDER_THUMB_CONTEXT_MENU,
  RENDER_META_CONTEXT_MENU,
  DISMISS_TABLE_CONTEXT_MENU,
  DISMISS_THUMB_CONTEXT_MENU,
  DISMISS_META_CONTEXT_MENU,
  RESET_CONTEXT_MENU,
} from '../constants/actionTypes'

const initialState = {
  showTableCtxtMenu: false,
  showThumbCtxtMenu: false,
  showMetaCtxtMenu: false,
  contextMenuPos: { x: 0, y: 0 },
}

export default function(state = initialState, action) {
  switch (action.type) {
    case RENDER_TABLE_CONTEXT_MENU:
      return {
        ...state,
        showTableCtxtMenu: action.payload.show,
        showThumbCtxtMenu: !action.payload.show,
        showMetaCtxtMenu: !action.payload.show,
        contextMenuPos: action.payload.contextMenuPos,
        selectedFieldIndex: action.payload.selectedFieldIndex,
      }
    case RENDER_THUMB_CONTEXT_MENU:
      return {
        ...state,
        showTableCtxtMenu: !action.payload.show,
        showThumbCtxtMenu: action.payload.show,
        showMetaCtxtMenu: !action.payload.show,
        contextMenuPos: action.payload.contextMenuPos,
      }
    case RENDER_META_CONTEXT_MENU:
      return {
        ...state,
        showTableCtxtMenu: !action.payload.show,
        showThumbCtxtMenu: !action.payload.show,
        showMetaCtxtMenu: action.payload.show,
        contextMenuPos: action.payload.contextMenuPos,
      }
    case DISMISS_TABLE_CONTEXT_MENU:
      return {
        ...state,
        showTableCtxtMenu: action.payload.show,
        contextMenuPos: action.payload.contextMenuPos,
      }
    case DISMISS_THUMB_CONTEXT_MENU:
      return {
        ...state,
        showThumbCtxtMenu: action.payload.show,
        contextMenuPos: action.payload.contextMenuPos,
      }
    case DISMISS_META_CONTEXT_MENU:
      return {
        ...state,
        showMetaCtxtMenu: action.payload.show,
        contextMenuPos: action.payload.contextMenuPos,
      }
    case RESET_CONTEXT_MENU:
      return {
        ...state,
        contextMenuPos: action.payload,
      }
  }
  return state
}
