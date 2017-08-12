import {
  SHOW_MODAL, HIDE_MODAL, SORT_FOLDERS,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, LIGHTBOX_METADATA,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH,
  THUMB_SIZE, THUMB_LAYOUT, SHOW_TABLE, TABLE_HEIGHT,
  SHOW_MULTIPAGE, VIDEO_VOLUME,
  HOVER_FIELD, CLEAR_HOVER_FIELD,
  SHOW_DIALOG_ALERT, HIDE_DIALOG_ALERT,
  SHOW_DIALOG_CONFIRM, HIDE_DIALOG_CONFIRM,
  SHOW_DIALOG_PROMPT, HIDE_DIALOG_PROMPT,
  THUMB_FIELD_TEMPLATE, DRAG_FIELD_TEMPLATE, LIGHTBAR_FIELD_TEMPLATE,
  UX_LEVEL, EMBEDMODE_ENABLED, MONOCHROME
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

// Show a DialogAlert -- similar to the native alert() call,
// but async with Zorroa styling and wrapped in a convenient promise.
// Returns a promise that resolves when the user confirms or closes the dialog.
// The promise always resolves and never rejects.
// The dialog is hidden automatically.
export function dialogAlertPromise (title, message) {
  return dispatch => {
    return new Promise(resolve => {
      dispatch({
        type: SHOW_DIALOG_ALERT,
        payload: { title, message, confirmAction: resolve }
      })
    })
    .then(_ => {
      console.log('DISMISSED!')
      dispatch({
        type: HIDE_DIALOG_ALERT,
        payload: null
      })
    })
  }
}

// Show a DialogConfirm -- similar to the native confirm() call,
// but async with Zorroa styling and wrapped in a convenient promise.
// This returns a promise that resolves when the user confirms.
// If the user closes or cancels the prompt, the promise will reject.
// The dialog is hidden automatically.
export function dialogConfirmPromise (title, message) {
  const hideConfirmAction = {
    type: HIDE_DIALOG_CONFIRM,
    payload: null
  }

  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: SHOW_DIALOG_CONFIRM,
        payload: { title, message, confirmAction: resolve, cancelAction: reject }
      })
    })
    .then(
      function _confirmConfirm () {
        dispatch(hideConfirmAction)
      },
      function _confirmCancel () {
        dispatch(hideConfirmAction)
        return Promise.reject()
      }
    )
  }
}

// Show a DialogPrompt -- similar to the native prompt() call,
// but async with Zorroa styling and wrapped in a convenient promise.
// This returns a promise that resolves with the prompted value.
// If the user closes or cancels the prompt, the promise will reject.
// The dialog is closed automatically.
export function dialogPromptPromise (title, message) {
  const hidePromptAction = {
    type: HIDE_DIALOG_PROMPT,
    payload: null
  }

  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: SHOW_DIALOG_PROMPT,
        payload: { title, message, confirmAction: resolve, cancelAction: reject }
      })
    })
    .then(
      function _promptConfirm (value) {
        dispatch(hidePromptAction)
        return value
      },
      function _promptCancel () {
        dispatch(hidePromptAction)
        return Promise.reject()
      }
    )
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

export function thumbFieldTemplate (template) {
  return ({
    type: THUMB_FIELD_TEMPLATE,
    payload: template
  })
}

export function lightbarFieldTemplate (template) {
  return ({
    type: LIGHTBAR_FIELD_TEMPLATE,
    payload: template
  })
}

export function dragFieldTemplate (template) {
  return ({
    type: DRAG_FIELD_TEMPLATE,
    payload: template
  })
}

export function uxLevel (level) {
  return ({
    type: UX_LEVEL,
    payload: level
  })
}

export function setEmbedModeEnabled (isEnabled) {
  return ({
    type: EMBEDMODE_ENABLED,
    payload: isEnabled
  })
}
export function monochrome (state) {
  return ({
    type: MONOCHROME,
    payload: state
  })
}
