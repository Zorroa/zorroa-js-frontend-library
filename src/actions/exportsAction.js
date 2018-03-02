import {
  UPDATE_EXPORT_UI,
  LOAD_EXPORT_PROFILE_BLOB,
  LOAD_EXPORT_PROFILE_BLOB_SUCCESS,
  LOAD_EXPORT_PROFILE_BLOB_ERROR,
  POST_EXPORT_PROFILE_BLOB_ERROR,
  POST_EXPORT_PROFILE_BLOB_SUCCESS,
  POST_EXPORT_PROFILE_BLOB_CLEAR,
  POST_EXPORT_PROFILE_BLOB
} from '../constants/actionTypes'
import api from '../api'
const APP_NAME = 'curator'

export function loadExportProfiles () {
  return dispatch => {
    dispatch({
      type: LOAD_EXPORT_PROFILE_BLOB
    })

    api
      .blob(APP_NAME)
      .get({
        feature: 'exports',
        name: 'profiles'
      })
      .then(response => {
        dispatch({
          type: LOAD_EXPORT_PROFILE_BLOB_SUCCESS,
          payload: response
        })
      }, errorResponse => {
        dispatch({
          type: LOAD_EXPORT_PROFILE_BLOB_ERROR,
          payload: errorResponse.data
        })
      })
  }
}

export function postExportProfiles (data) {
  return dispatch => {
    dispatch({
      type: POST_EXPORT_PROFILE_BLOB
    })

    api
      .blob(APP_NAME)
      .post({
        feature: 'exports',
        name: 'profiles',
        payload: {
          data,
          version: 1,
          dateUpdated: Number(new Date())
        }
      })
      .then(response => {
        dispatch({
          type: POST_EXPORT_PROFILE_BLOB_SUCCESS,
          payload: response
        })
      }, errorResponse => {
        dispatch({
          type: POST_EXPORT_PROFILE_BLOB_ERROR,
          payload: errorResponse.data
        })
      })
  }
}

export function clearPostExportLoadingStates () {
  return dispatch => {
    dispatch({
      type: POST_EXPORT_PROFILE_BLOB_CLEAR
    })
  }
}

export function updateExportInterface ({
  shouldShow
}) {
  return dispatch => {
    dispatch({
      type: UPDATE_EXPORT_UI,
      payload: {
        shouldShow: shouldShow
      }
    })
  }
}
