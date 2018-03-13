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
  shouldShow,
  packageName,
  assetSearch
}) {
  return dispatch => {
    if (assetSearch) {
      assetSearch.aggs = {
        extension: {
          terms: {
            field: 'source.extension'
          }
        }
      }

      api
        .search(assetSearch)
        .then(response => {
          console.log(response)
          dispatch({
            type: UPDATE_EXPORT_UI,
            payload: {
              shouldShow,
              packageName,
              exportAssets: response.assets
            }
          })
        })
    }

    dispatch({
      type: UPDATE_EXPORT_UI,
      payload: {
        shouldShow
      }
    })
  }
}
