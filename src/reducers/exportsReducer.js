import {
  SHOW_EXPORT_UI,
  HIDE_EXPORT_UI,
  UPDATE_EXPORT_UI,
  LOAD_EXPORT_PROFILE_BLOB,
  LOAD_EXPORT_PROFILE_BLOB_SUCCESS,
  LOAD_EXPORT_PROFILE_BLOB_ERROR,
  POST_EXPORT_PROFILE_BLOB,
  POST_EXPORT_PROFILE_BLOB_SUCCESS,
  POST_EXPORT_PROFILE_BLOB_ERROR,
  POST_EXPORT_PROFILE_BLOB_CLEAR,
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
import {
  FILE_GROUP_IMAGES,
  FILE_GROUP_VIDEOS,
  FILE_GROUP_DOCUMENTS,
  groupExts,
} from '../constants/fileTypes'
import AssetSearch from '../models/AssetSearch'

export const initialState = {
  // Deterimines if the exports modal should be display
  shouldShow: false,

  // Generic container for error messages
  errorMessage: undefined,

  // State for loading presets (profiles) from the server
  exportProfiles: [],
  exportProfilesLoading: false,
  exportProfilesError: false,
  exportProfilesSuccess: false,

  // State for detecting online vs. offline (i.e. tape backup, Amazon Glacier, airgap, etc)
  onlineAssets: 0,
  offlineAssets: 0,
  loadingOnlineStatuses: false,
  loadingOnlineStatusesError: false,
  loadingOnlineStatusesSuccess: false,

  // State for saving presets (profiles) to the server
  exportProfilesPosting: false,
  exportProfilesPostingError: false,

  // State for requesting a manual export
  exportRequestPosting: false,
  exportRequestPostingError: false,
  exportRequestPostingSuccess: false,

  // State for executing an export
  loadingCreateExport: false,
  loadingCreateExportError: false,
  loadingCreateExportSuccess: false,

  // State for asset search previews and statistics
  exportPreviewAssets: [],
  imageAssetCount: 0,
  videoAssetCount: 0,
  flipbookAssetCount: 0,
  documentAssetCount: 0,
  totalAssetCount: 0,
  isLoading: false,
  hasRestrictedAssets: false,
  assetSearch: new AssetSearch(),
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SHOW_EXPORT_UI: {
      return {
        ...state,
        isLoading: true,
        shouldShow: true,
        assetSearch: action.payload.assetSearch,
        packageName: action.payload.packageName,
      }
    }
    case HIDE_EXPORT_UI: {
      return initialState
    }
    case UPDATE_EXPORT_UI: {
      const {
        hasRestrictedAssets,
        totalAssetCount,
        exportPreviewAssets,
      } = action.payload
      const assetGroupCounts = [
        FILE_GROUP_IMAGES,
        FILE_GROUP_VIDEOS,
        FILE_GROUP_DOCUMENTS,
      ].reduce((accumulatorGroupCounts, groupKey) => {
        accumulatorGroupCounts[groupKey] = groupExts[groupKey].reduce(
          (accumulator, extension) => {
            const extensionDocumentCount =
              action.payload.documentCounts.extension[extension]
            if (extensionDocumentCount) {
              return extensionDocumentCount + accumulator
            }

            return accumulator
          },
          0,
        )

        return accumulatorGroupCounts
      }, {})

      return {
        ...state,
        isLoading: false,
        exportPreviewAssets,
        hasRestrictedAssets,
        imageAssetCount: assetGroupCounts[FILE_GROUP_IMAGES] || 0,
        videoAssetCount: assetGroupCounts[FILE_GROUP_VIDEOS] || 0,
        flipbookAssetCount: action.payload.clipParentCounts.type.flipbook || 0,
        documentAssetCount: assetGroupCounts[FILE_GROUP_DOCUMENTS] || 0,
        totalAssetCount,
      }
    }
    case LOAD_EXPORT_PROFILE_BLOB: {
      const exportProfilesLoading = true
      const exportProfilesError = false
      return { ...state, exportProfilesLoading, exportProfilesError }
    }
    case LOAD_EXPORT_PROFILE_BLOB_SUCCESS: {
      const exportProfilesLoading = false
      const exportProfiles = action.payload.data
      return { ...state, exportProfilesLoading, exportProfiles }
    }
    case LOAD_EXPORT_PROFILE_BLOB_ERROR: {
      const exportProfilesLoading = false
      const exportProfilesError = true
      return { ...state, exportProfilesLoading, exportProfilesError }
    }
    case POST_EXPORT_PROFILE_BLOB: {
      const exportProfilesPosting = true
      const exportProfilesPostingError = false
      const exportProfilesSuccess = false
      return {
        ...state,
        exportProfilesPosting,
        exportProfilesPostingError,
        exportProfilesSuccess,
      }
    }
    case POST_EXPORT_PROFILE_BLOB_SUCCESS: {
      const exportProfilesPosting = false
      const exportProfiles = action.payload.data
      const exportProfilesSuccess = true

      return {
        ...state,
        exportProfilesPosting,
        exportProfilesSuccess,
        exportProfiles,
      }
    }
    case POST_EXPORT_PROFILE_BLOB_ERROR: {
      const exportProfilesPosting = false
      const exportProfilesPostingError = true
      return {
        ...state,
        exportProfilesPosting,
        exportProfilesPostingError,
      }
    }
    case POST_EXPORT_PROFILE_BLOB_CLEAR: {
      const exportProfilesPosting = false
      const exportProfilesPostingError = false
      const exportProfilesSuccess = false
      const errorMessage = action.payload && action.payload.message

      return {
        ...state,
        exportProfilesPosting,
        exportProfilesPostingError,
        exportProfilesSuccess,
        errorMessage,
      }
    }
    case EXPORT_REQUEST_START: {
      const exportRequestPosting = true
      const exportRequestPostingError = false
      const exportRequestPostingSuccess = false
      const errorMessage = undefined

      return {
        ...state,
        exportRequestPosting,
        exportRequestPostingError,
        exportRequestPostingSuccess,
        errorMessage,
      }
    }
    case EXPORT_REQUEST_SUCCESS: {
      const exportRequestPosting = false
      const exportRequestPostingError = false
      const exportRequestPostingSuccess = true

      return {
        ...state,
        exportRequestPosting,
        exportRequestPostingError,
        exportRequestPostingSuccess,
      }
    }
    case EXPORT_REQUEST_ERROR: {
      const exportRequestPosting = false
      const exportRequestPostingError = true
      const exportRequestPostingSuccess = false
      const errorMessage = action.payload && action.payload.message

      return {
        ...state,
        exportRequestPosting,
        exportRequestPostingError,
        exportRequestPostingSuccess,
        errorMessage,
      }
    }
    case EXPORT_ONLINE_STATUS_START: {
      const onlineAssets = 0
      const offlineAssets = 0
      const loadingOnlineStatuses = true
      const loadingOnlineStatusesError = false
      const loadingOnlineStatusesSuccess = false

      return {
        ...state,
        onlineAssets,
        offlineAssets,
        loadingOnlineStatuses,
        loadingOnlineStatusesError,
        loadingOnlineStatusesSuccess,
      }
    }
    case EXPORT_ONLINE_STATUS_SUCCESS: {
      const onlineAssets = action.payload.totalOnline
      const offlineAssets = action.payload.totalOffline
      const loadingOnlineStatuses = false
      const loadingOnlineStatusesError = false
      const loadingOnlineStatusesSuccess = true

      return {
        ...state,
        onlineAssets,
        offlineAssets,
        loadingOnlineStatuses,
        loadingOnlineStatusesError,
        loadingOnlineStatusesSuccess,
      }
    }
    case EXPORT_ONLINE_STATUS_ERROR: {
      const loadingOnlineStatuses = false
      const loadingOnlineStatusesError = true
      const loadingOnlineStatusesSuccess = false

      return {
        ...state,
        loadingOnlineStatuses,
        loadingOnlineStatusesError,
        loadingOnlineStatusesSuccess,
      }
    }
    case CREATE_EXPORT_START: {
      const loadingCreateExport = true
      const loadingCreateExportError = false
      const loadingCreateExportSuccess = false
      const errorMessage = undefined

      return {
        ...state,
        loadingCreateExport,
        loadingCreateExportError,
        loadingCreateExportSuccess,
        errorMessage,
      }
    }
    case CREATE_EXPORT_SUCCESS: {
      const loadingCreateExport = false
      const loadingCreateExportError = false
      const loadingCreateExportSuccess = true

      return {
        ...state,
        loadingCreateExport,
        loadingCreateExportError,
        loadingCreateExportSuccess,
      }
    }
    case CREATE_EXPORT_ERROR: {
      const loadingCreateExport = false
      const loadingCreateExportError = true
      const loadingCreateExportSuccess = false
      const errorMessage = action.payload && action.payload.message

      return {
        ...state,
        loadingCreateExport,
        loadingCreateExportError,
        loadingCreateExportSuccess,
        errorMessage,
      }
    }
  }

  return state
}
