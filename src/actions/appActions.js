import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE, METADATA_FIELDS, TABLE_FIELDS, DISPLAY_OPTIONS } from '../constants/actionTypes'

export function updateModal ({title, footer, content}) {
  return {
    type: MODAL,
    payload: {title, footer, content}
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

export const HIDE_DISPLAY_OPTIONS = 'HIDE_DISPLAY_OPTIONS'
export const METADATA_DISPLAY_OPTIONS = 'METADATA_DISPLAY_OPTIONS'
export const TABLE_DISPLAY_OPTIONS = 'TABLE_DISPLAY_OPTIONS'
export const FIELD_DISPLAY_OPTIONS = 'FIELD_DISPLAY_OPTIONS'

export function displayOptions (mode) {
  return ({
    type: DISPLAY_OPTIONS,
    payload: mode
  })
}
