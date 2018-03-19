import {
  SHOW_EXPORT_UI,
  HIDE_EXPORT_UI,
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

export function showExportInterface () {
  return dispatch => {
    dispatch({
      type: SHOW_EXPORT_UI
    })
  }
}

export function hideExportInterface () {
  return dispatch => {
    dispatch({
      type: HIDE_EXPORT_UI
    })
  }
}

export function updateExportInterface ({
  packageName,
  assetSearch
}) {
  return dispatch => {
    // Aggs are not part of an export search query and can't return any data
    // so it's safe to just overwrite the search
    assetSearch.aggs = {
      extension: {
        terms: {
          field: 'source.extension'
        }
      }
    }

    // Only pull back enough assets to render a preview
    assetSearch.size = 12

    dispatch({
      type: SHOW_EXPORT_UI
    })

    api
      .search(assetSearch)
      .then(({aggregations, assets, page}) => {
        dispatch({
          type: UPDATE_EXPORT_UI,
          payload: {
            packageName,
            exportAssets: assets,
            totalAssetCount: page.totalCount,
            documentCounts: {
              extension: aggregations.extension.buckets.reduce((accumulator, bucket) => {
                accumulator[bucket.key] = bucket.doc_count
                return accumulator
              }, {})
            }
          }
        })
      })
  }
}
