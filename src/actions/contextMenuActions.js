import {
  RENDER_TABLE_CONTEXT_MENU,
  RENDER_THUMB_CONTEXT_MENU,
  RENDER_META_CONTEXT_MENU,
  DISMISS_TABLE_CONTEXT_MENU,
  DISMISS_THUMB_CONTEXT_MENU,
  DISMISS_META_CONTEXT_MENU,
  RESET_CONTEXT_MENU,
} from '../constants/actionTypes'

export function showTableContextMenu(position, selectedFieldIndex) {
  const contextMenuPos = position
  const show = true

  return {
    type: RENDER_TABLE_CONTEXT_MENU,
    payload: {
      selectedFieldIndex,
      contextMenuPos,
      show,
    },
  }
}

export function dismissTableContextMenu() {
  const contextMenuPos = { x: 0, y: 0 }
  const show = false

  return {
    type: DISMISS_TABLE_CONTEXT_MENU,
    payload: {
      contextMenuPos,
      show,
    },
  }
}

export function showThumbContextMenu(position) {
  const contextMenuPos = position
  const show = true

  return {
    type: RENDER_THUMB_CONTEXT_MENU,
    payload: {
      contextMenuPos,
      show,
    },
  }
}

export function dismissThumbContextMenu() {
  const contextMenuPos = { x: 0, y: 0 }
  const show = false

  return {
    type: DISMISS_THUMB_CONTEXT_MENU,
    payload: {
      contextMenuPos,
      show,
    },
  }
}

export function showMetaContextMenu(position) {
  const contextMenuPos = position
  const show = true

  return {
    type: RENDER_META_CONTEXT_MENU,
    payload: {
      contextMenuPos,
      show,
    },
  }
}

export function dismissMetaContextMenu() {
  const contextMenuPos = { x: 0, y: 0 }
  const show = false

  return {
    type: DISMISS_META_CONTEXT_MENU,
    payload: {
      contextMenuPos,
      show,
    },
  }
}

export function resetContextMenuPos(newContextMenuPos) {
  return {
    type: RESET_CONTEXT_MENU,
    payload: newContextMenuPos,
  }
}
