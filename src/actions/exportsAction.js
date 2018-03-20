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
  POST_EXPORT_PROFILE_BLOB,
  EXPORT_REQUEST_START,
  EXPORT_REQUEST_SUCCESS,
  EXPORT_REQUEST_ERROR
} from '../constants/actionTypes'
import api from '../api'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
const APP_NAME = 'curator'

export function exportRequest (requestPayload) {
  return dispatch => {
    dispatch({
      type: EXPORT_REQUEST_START
    })

    api
      .request
      .post({
        folderId: requestPayload.folderId,
        type: requestPayload.type,
        emailCC: [requestPayload.emailCC],
        comment: requestPayload.comment
      })
      .then(response => {
        dispatch({
          type: EXPORT_REQUEST_SUCCESS,
          payload: response
        })
      }, errorResponse => {
        dispatch({
          type: EXPORT_REQUEST_ERROR,
          payload: errorResponse.data
        })
      })
  }
}

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
  assetSearch,
  permissionIds
}) {
  return dispatch => {
    const assetSearchAggregations = new AssetSearch(assetSearch)
    // Aggs are not part of an export search query and can't return any data
    // so it's safe to just overwrite the search
    assetSearchAggregations.aggs = {
      extension: {
        terms: {
          field: 'source.extension'
        }
      }
    }

    // Only pull back enough assets to render a preview
    assetSearchAggregations.size = 12

    // Users may not be able to export all assets in their search. Conduct a seperate
    // search to deterimine which assets will actually be exported.
    const restrictedAssetSearch = new AssetSearch(assetSearch)
    const restrictedFilter = new AssetFilter({
      terms: {
        'zorroa.permissions.export': Array.isArray(permissionIds) ? permissionIds : []
      }
    })

    restrictedAssetSearch.filter.merge(restrictedFilter)

    const exportPromises = Promise.all([
      api.search(assetSearchAggregations),
      api.search(restrictedAssetSearch)
    ])

    dispatch({
      type: SHOW_EXPORT_UI
    })

    exportPromises.then(([assetSearchResponse, restrictedAssetSearch]) => {
      const {aggregations, assets, page} = assetSearchResponse
      const totalAssetCount = page.totalCount
      const availableSearchAssets = restrictedAssetSearch.page.totalCount

      dispatch({
        type: UPDATE_EXPORT_UI,
        payload: {
          packageName,
          assetSearch,
          exportPreviewAssets: assets,
          hasRestrictedAssets: availableSearchAssets >= totalAssetCount,
          totalAssetCount,
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
