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
  POST_EXPORT_PROFILE_BLOB_CLEAR
} from '../constants/actionTypes'
import {
  FILE_GROUP_IMAGES,
  FILE_GROUP_VIDEOS,
  FILE_GROUP_FLIPBOOKS,
  FILE_GROUP_DOCUMENTS,
  groupExts
} from '../constants/fileTypes'

export const initialState = {
  // Deterimines if the exports modal should be display
  shouldShow: false,

  // State for loading presets (profiles) from the server
  exportProfiles: [],
  exportProfilesLoading: false,
  exportProfilesError: false,
  exportProfilesSuccess: false,

  // State for saving presets (profiles) to the server
  exportProfilesPosting: false,
  exportProfilesPostingError: false,

  // State for asset search previews and statistics
  exportPreviewAssets: [],
  imageAssetCount: 0,
  movieAssetCount: 0,
  flipbookAssetCount: 0,
  documentAssetCount: 0,
  totalAssetCount: 0,
  isLoading: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case SHOW_EXPORT_UI: {
      return {
        ...state,
        isLoading: true,
        shouldShow: true
      }
    }
    case HIDE_EXPORT_UI: {
      return {
        ...state,
        shouldShow: false,
        exportPreviewAssets: [],
        imageAssetCount: 0,
        movieAssetCount: 0,
        flipbookAssetCount: 0,
        documentAssetCount: 0,
        totalAssetCount: 0,
        isLoading: false
      }
    }
    case UPDATE_EXPORT_UI: {
      const exportPreviewAssets = action.payload.exportAssets
      const totalAssetCount = action.payload.totalAssetCount
      const assetGroupCounts = [
        FILE_GROUP_IMAGES,
        FILE_GROUP_VIDEOS,
        FILE_GROUP_FLIPBOOKS,
        FILE_GROUP_DOCUMENTS
      ].reduce((accumulatorGroupCounts, groupKey) => {
        accumulatorGroupCounts[groupKey] = groupExts[groupKey]
          .reduce((accumulator, extension) => {
            const extensionDocumentCount = action.payload.documentCounts.extension[extension]
            if (extensionDocumentCount) {
              return extensionDocumentCount + accumulator
            }

            return accumulator
          }, 0)

        return accumulatorGroupCounts
      }, {})

      return {
        ...state,
        isLoading: false,
        exportPreviewAssets,
        imageAssetCount: assetGroupCounts[FILE_GROUP_IMAGES] || 0,
        videoAssetCount: assetGroupCounts[FILE_GROUP_VIDEOS] || 0,
        flipbookAssetCount: assetGroupCounts[FILE_GROUP_FLIPBOOKS] || 0,
        documentAssetCount: assetGroupCounts[FILE_GROUP_DOCUMENTS] || 0,
        totalAssetCount
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
        exportProfilesSuccess
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
        exportProfiles
      }
    }
    case POST_EXPORT_PROFILE_BLOB_ERROR: {
      const exportProfilesPosting = false
      const exportProfilesPostingError = true
      return {
        ...state,
        exportProfilesPosting,
        exportProfilesPostingError
      }
    }
    case POST_EXPORT_PROFILE_BLOB_CLEAR: {
      const exportProfilesPosting = false
      const exportProfilesPostingError = false
      const exportProfilesSuccess = false

      return {
        ...state,
        exportProfilesPosting,
        exportProfilesPostingError,
        exportProfilesSuccess
      }
    }
  }

  return state
}
