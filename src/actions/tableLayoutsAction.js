import {
  BLOB_FEATURE_NAME_METADATA_LAYOUTS,
  APP_NAME,
} from '../constants/general'
import {
  SHARE_TABLE_LAYOUT,
  SHARE_TABLE_LAYOUT_SUCCESS,
  SHARE_TABLE_LAYOUT_ERROR,
  FETCH_TABLE_LAYOUT,
  FETCH_TABLE_LAYOUT_SUCCESS,
  FETCH_TABLE_LAYOUT_ERROR,
  DELETE_SHARED_TABLE_LAYOUT,
  DELETE_SHARED_LAYOUT_SUCCESS,
  DELETE_SHARED_TABLE_LAYOUT_ERROR,
} from '../constants/actionTypes'
import api from '../api'
import camelCase from 'camel-case'

export function shareTableLayout(layoutName, fields, layoutId) {
  return dispatch => {
    dispatch({
      type: SHARE_TABLE_LAYOUT,
      payload: {
        layoutId,
      },
    })
    const request = {
      feature: BLOB_FEATURE_NAME_METADATA_LAYOUTS,
      name: camelCase(layoutName),
      payload: {
        version: 1,
        fields,
        name: layoutName,
      },
    }
    api
      .blob(APP_NAME)
      .post(request)
      .then(
        response => {
          dispatch({
            type: SHARE_TABLE_LAYOUT_SUCCESS,
            payload: {
              response,
              layoutId,
            },
          })
        },
        errorResponse => {
          dispatch({
            type: SHARE_TABLE_LAYOUT_ERROR,
            payload: {
              layoutId,
              errorResponse,
            },
          })
        },
      )
  }
}

export function fetchTableLayouts() {
  return dispatch => {
    dispatch({
      type: FETCH_TABLE_LAYOUT,
    })

    api
      .blob(APP_NAME)
      .get({
        feature: BLOB_FEATURE_NAME_METADATA_LAYOUTS,
      })
      .then(
        response => {
          dispatch({
            type: FETCH_TABLE_LAYOUT_SUCCESS,
            payload: response,
          })
        },
        errorResponse => {
          dispatch({
            type: FETCH_TABLE_LAYOUT_ERROR,
            payload: errorResponse,
          })
        },
      )
  }
}

export function deleteMetadataTableLayout(layoutBlobName, layoutBlobId) {
  return dispatch => {
    dispatch({
      type: DELETE_SHARED_TABLE_LAYOUT,
    })

    api
      .blob(APP_NAME)
      .delete({
        feature: BLOB_FEATURE_NAME_METADATA_LAYOUTS,
        name: layoutBlobName,
      })
      .then(
        response => {
          dispatch({
            type: DELETE_SHARED_LAYOUT_SUCCESS,
            payload: {
              layoutBlobName,
              layoutBlobId,
            },
          })
        },
        () => {
          dispatch({
            type: DELETE_SHARED_TABLE_LAYOUT_ERROR,
            payload: {
              layoutBlobName,
              layoutBlobId,
            },
          })
        },
      )
  }
}
