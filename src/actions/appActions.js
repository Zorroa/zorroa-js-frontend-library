import {
  SHOW_MODAL, HIDE_MODAL,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, TABLE_FIELDS, LIGHTBAR_FIELDS, SYNC_FIELDS,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH, SHOW_IMPORT_SCRIPT_INFO
} from '../constants/actionTypes'

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

export function updateTableFields (fields) {
  return ({
    type: TABLE_FIELDS,
    payload: fields
  })
}

export function updateLightbarFields (fields) {
  return ({
    type: LIGHTBAR_FIELDS,
    payload: fields
  })
}

export function syncMetadataAndTableFields (sync) {
  return ({
    type: SYNC_FIELDS,
    payload: sync
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

export function showImportScriptInfo (show) {
  return ({
    type: SHOW_IMPORT_SCRIPT_INFO,
    payload: show
  })
}
