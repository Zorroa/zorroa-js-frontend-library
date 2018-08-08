import { APP_NAME } from '../constants/general'
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
  EXPORT_REQUEST_ERROR,
  EXPORT_ONLINE_STATUS_START,
  EXPORT_ONLINE_STATUS_SUCCESS,
  EXPORT_ONLINE_STATUS_ERROR,
  CREATE_EXPORT_START,
  CREATE_EXPORT_SUCCESS,
  CREATE_EXPORT_ERROR,
} from '../constants/actionTypes'
import api from '../api'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'

/**
 * This starts off the backend Exporters
 */
export function createExport(requestPayload) {
  return dispatch => {
    dispatch({
      type: CREATE_EXPORT_START,
    })

    api.exports.post(requestPayload).then(
      response => {
        dispatch({
          type: CREATE_EXPORT_SUCCESS,
          payload: response,
        })
      },
      errorResponse => {
        dispatch({
          type: CREATE_EXPORT_ERROR,
          payload: errorResponse.response.data,
        })
      },
    )
  }
}

/**
 * Detects what files in a given search are online (i.e. the Archivist has access
 * to them) vs. offline (i.e. they're on a tape drive or airgapped).
 */
export function onlineStatus(requestPayload) {
  return dispatch => {
    dispatch({
      type: EXPORT_ONLINE_STATUS_START,
    })

    api.localFileSystem
      .online({
        search: requestPayload,
      })
      .then(
        response => {
          dispatch({
            type: EXPORT_ONLINE_STATUS_SUCCESS,
            payload: response,
          })
        },
        errorResponse => {
          dispatch({
            type: EXPORT_ONLINE_STATUS_ERROR,
            payload: errorResponse.data,
          })
        },
      )
  }
}

/**
 * Sends a manual export request. This will then be evaulated and acted upon
 * based on some kind of external workflow that we don't care about.
 */
export function exportRequest(requestPayload) {
  return dispatch => {
    dispatch({
      type: EXPORT_REQUEST_START,
    })

    api.request
      .post({
        folderId: requestPayload.folderId,
        type: requestPayload.type,
        emailCC: [requestPayload.emailCC],
        comment: requestPayload.comment,
      })
      .then(
        response => {
          dispatch({
            type: EXPORT_REQUEST_SUCCESS,
            payload: response,
          })
        },
        errorResponse => {
          dispatch({
            type: EXPORT_REQUEST_ERROR,
            payload: errorResponse.response.data,
          })
        },
      )
  }
}

/**
 * This loads up a user's favorite export settings so that they can be used again
 */
export function loadExportProfiles() {
  return dispatch => {
    dispatch({
      type: LOAD_EXPORT_PROFILE_BLOB,
    })

    api
      .blob(APP_NAME)
      .get({
        feature: 'exports',
        name: 'profiles',
      })
      .then(
        response => {
          dispatch({
            type: LOAD_EXPORT_PROFILE_BLOB_SUCCESS,
            payload: response,
          })
        },
        errorResponse => {
          if (
            errorResponse.excption ===
            'com.zorroa.sdk.client.exception.EntityNotFoundException'
          ) {
            dispatch({
              type: LOAD_EXPORT_PROFILE_BLOB_SUCCESS,
              payload: [],
            })
            return
          }

          dispatch({
            type: LOAD_EXPORT_PROFILE_BLOB_ERROR,
            payload: errorResponse.data,
          })
        },
      )
  }
}

export function postExportProfiles(data) {
  return dispatch => {
    dispatch({
      type: POST_EXPORT_PROFILE_BLOB,
    })

    api
      .blob(APP_NAME)
      .post({
        feature: 'exports',
        name: 'profiles',
        payload: {
          data,
          version: 1,
          dateUpdated: Number(new Date()),
        },
      })
      .then(
        response => {
          dispatch({
            type: POST_EXPORT_PROFILE_BLOB_SUCCESS,
            payload: response,
          })
        },
        errorResponse => {
          dispatch({
            type: POST_EXPORT_PROFILE_BLOB_ERROR,
            payload: errorResponse.response.data,
          })
        },
      )
  }
}

export function clearPostExportLoadingStates() {
  return dispatch => {
    dispatch({
      type: POST_EXPORT_PROFILE_BLOB_CLEAR,
    })
  }
}

export function hideExportInterface() {
  return dispatch => {
    dispatch({
      type: HIDE_EXPORT_UI,
    })
  }
}

export function updateExportInterface({
  packageName,
  assetSearch,
  permissionIds,
}) {
  return dispatch => {
    const assetSearchAggregations = new AssetSearch(assetSearch)
    // Aggs are not part of an export search query and can't return any data
    // so it's safe to just overwrite the search
    assetSearchAggregations.aggs = {
      extension: {
        terms: {
          field: 'source.extension.raw',
        },
      },
      clipType: {
        terms: {
          field: 'media.clip.type',
        },
        aggs: {
          parent: {
            terms: {
              field: 'media.clip.parent.raw',
            },
          },
        },
      },
    }

    // Only pull back enough assets to render a preview
    assetSearchAggregations.size = 12

    // Users may not be able to export all assets in their search. Conduct a seperate
    // search to deterimine which assets will actually be exported.
    const restrictedAssetSearch = new AssetSearch(assetSearch)
    const restrictedFilter = new AssetFilter({
      terms: {
        'zorroa.permissions.export': Array.isArray(permissionIds)
          ? permissionIds
          : [],
      },
    })

    restrictedAssetSearch.filter.merge(restrictedFilter)

    const exportPromises = Promise.all([
      api.search(assetSearchAggregations),
      api.search(restrictedAssetSearch),
    ])

    dispatch({
      type: SHOW_EXPORT_UI,
      payload: {
        packageName,
        assetSearch,
      },
    })

    exportPromises.then(([assetSearchResponse, restrictedAssetSearch]) => {
      const { aggregations, assets, page } = assetSearchResponse
      const totalAssetCount = page.totalCount
      const availableSearchAssets = restrictedAssetSearch.page.totalCount

      dispatch({
        type: UPDATE_EXPORT_UI,
        payload: {
          exportPreviewAssets: assets,
          hasRestrictedAssets: availableSearchAssets >= totalAssetCount,
          totalAssetCount,
          clipParentCounts: {
            type: aggregations.clipType.buckets.reduce(
              (accumulator, bucket) => {
                accumulator[bucket.key] = bucket.parent.buckets.length
                return accumulator
              },
              {},
            ),
          },
          documentCounts: {
            extension: aggregations.extension.buckets.reduce(
              (accumulator, bucket) => {
                accumulator[bucket.key] = bucket.doc_count
                return accumulator
              },
              {},
            ),
          },
        },
      })
    })
  }
}
