import {
  SHOW_MODAL, HIDE_MODAL,
  SHOW_DISPLAY_OPTIONS_MODAL, HIDE_DISPLAY_OPTIONS_MODAL,
  SHOW_CREATE_FOLDER_MODAL, HIDE_CREATE_FOLDER_MODAL,
  ICONIFY_LEFT_SIDEBAR, ICONIFY_RIGHT_SIDEBAR, TOGGLE_COLLAPSIBLE,
  METADATA_FIELDS, TABLE_FIELDS, SYNC_FIELDS,
  SET_DRAGGING, SET_TABLE_FIELD_WIDTH
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

export function showDisplayOptionsModal (title, syncLabel, selectedFields,
                                         singleSelection, fieldTypes,
                                         onUpdate, onDismiss) {
  return {
    type: SHOW_DISPLAY_OPTIONS_MODAL,
    payload: {
      title,
      syncLabel,
      selectedFields,
      singleSelection,
      fieldTypes,
      onUpdate,
      onDismiss
    }
  }
}

export function dismissDisplayOptionsModal () {
  return {
    type: HIDE_DISPLAY_OPTIONS_MODAL,
    payload: null
  }
}

export function showCreateFolderModal (title, acl, onCreate, name, onDelete, onLink, onDismiss) {
  return {
    type: SHOW_CREATE_FOLDER_MODAL,
    payload: {
      title,          // required
      acl,            // required
      onCreate,       // required
      name,           // optional folder name
      onDelete,       // optional delete button
      onLink,         // optional link button
      onDismiss       // not used?
    }
  }
}

export function dismissCreateFolderModal () {
  return {
    type: HIDE_CREATE_FOLDER_MODAL,
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

export function syncMetadataAndTableFields(sync) {
  return ({
    type: SYNC_FIELDS,
    payload: sync
  })
}

export function setIsDragging (isDragging) {
  return ({
    type: SET_DRAGGING,
    payload: isDragging
  })
}

// newFieldWidths should be an object of one or more [field]: width pairs
export function setTableFieldWidth (newFieldWidths) {
  return ({
    type: SET_TABLE_FIELD_WIDTH,
    payload: newFieldWidths
  })
}
