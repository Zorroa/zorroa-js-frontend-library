import { MODAL, ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE, METADATA_FIELDS, TABLE_FIELDS } from '../constants/actionTypes'

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
