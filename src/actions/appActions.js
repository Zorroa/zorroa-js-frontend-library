import {
  SHOW_MODAL, HIDE_MODAL, SORT_FOLDERS,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, LIGHTBAR_FIELDS, LIGHTBOX_METADATA,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT,
  SHOW_MULTIPAGE, SHOW_PAGES, VIDEO_VOLUME,
  HOVER_FIELD, CLEAR_HOVER_FIELD, SET_FUZZY,
  SHOW_DIALOG_ALERT, HIDE_DIALOG_ALERT,
  SHOW_DIALOG_CONFIRM, HIDE_DIALOG_CONFIRM
} from '../constants/actionTypes'

export const MIN_THUMBSIZE = 48
export const MAX_THUMBSIZE = 480
export const DELTA_THUMBSIZE = 48
export const DEFAULT_THUMBSIZE = 128

export function showModal (props) {
  return {
    type: SHOW_MODAL,
    payload: props
  }
}

export function hideModal () {
  return {
    type: HIDE_MODAL,
    payload: null
  }
}

export function showDialogAlert (title, message, confirmAction) {
  return {
    type: SHOW_DIALOG_ALERT,
    payload: { title, message, confirmAction }
  }
}

export function hideDialogAlert () {
  return {
    type: HIDE_DIALOG_ALERT,
    payload: null
  }
}

export function showDialogConfirm (title, message, confirmAction, cancelAction) {
  return {
    type: SHOW_DIALOG_CONFIRM,
    payload: { title, message, confirmAction, cancelAction }
  }
}

export function hideDialogConfirm () {
  return {
    type: HIDE_DIALOG_CONFIRM,
    payload: null
  }
}

export function iconifyLeftSidebar (isIconified) {
  return {
    type: ICONIFY_LEFT_SIDEBAR,
    payload: isIconified
  }
}

export function iconifyRightSidebar (isIconified) {
  return {
    type: ICONIFY_RIGHT_SIDEBAR,
    payload: isIconified
  }
}

export function toggleCollapsible (collapsibleName, isOpen) {
  return {
    type: TOGGLE_COLLAPSIBLE,
    payload: { collapsibleName, isOpen }
  }
}

export function updateMetadataFields (fields) {
  return ({
    type: METADATA_FIELDS,
    payload: fields
  })
}

export function updateLightbarFields (fields) {
  return ({
    type: LIGHTBAR_FIELDS,
    payload: fields
  })
}

export function lightboxMetadata ({show, left, top, width, height}) {
  return ({
    type: LIGHTBOX_METADATA,
    payload: { show, left, top, width, height }
  })
}

export function startDragging (type, data) {
  return ({
    type: SET_DRAGGING,
    payload: {type, ...data}  // expand data e.g. dragInfo.assetIds
  })
}

export function stopDragging () {
  return ({
    type: SET_DRAGGING,
    payload: null
  })
}

// newFieldWidths should be an object of one or more [field]: width pairs
export function setTableFieldWidth (newFieldWidths) {
  return ({
    type: SET_TABLE_FIELD_WIDTH,
    payload: newFieldWidths
  })
}

export function setThumbSize (size) {
  return ({
    type: THUMB_SIZE,
    payload: size
  })
}

export function setThumbLayout (layout) {
  return ({
    type: THUMB_LAYOUT,
    payload: layout
  })
}

export function showTable (show) {
  return ({
    type: SHOW_TABLE,
    payload: show
  })
}

export function setTableHeight (height) {
  return ({
    type: TABLE_HEIGHT,
    payload: height
  })
}

export function setVideoVolume (volume) {
  return ({
    type: VIDEO_VOLUME,
    payload: volume
  })
}

export function showMultipage (show) {
  return ({
    type: SHOW_MULTIPAGE,
    payload: show
  })
}

export function showPages (show) {
  return ({
    type: SHOW_PAGES,
    payload: show
  })
}

export function sortFolders (order) {
  return ({
    type: SORT_FOLDERS,
    payload: order
  })
}

export function hoverField (field) {
  return ({
    type: HOVER_FIELD,
    payload: field
  })
}

export function clearHoverField (field) {
  return ({
    type: CLEAR_HOVER_FIELD,
    payload: field
  })
}

export function setFuzzy (fuzzy) {
  return ({
    type: SET_FUZZY,
    payload: fuzzy
  })
}
