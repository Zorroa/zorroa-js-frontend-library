import {
  UPDATE_EXPORT_UI,
  LOAD_EXPORT_PROFILE_BLOB,
  LOAD_EXPORT_PROFILE_BLOB_SUCCESS,
  LOAD_EXPORT_PROFILE_BLOB_ERROR,
  POST_EXPORT_PROFILE_BLOB,
  POST_EXPORT_PROFILE_BLOB_SUCCESS,
  POST_EXPORT_PROFILE_BLOB_ERROR,
  POST_EXPORT_PROFILE_BLOB_CLEAR
} from '../constants/actionTypes'

export const initialState = {
  shouldShow: false,
  exportProfilesLoading: false,
  exportProfiles: [],
  exportProfilesError: false,
  exportProfilesSuccess: false,
  exportProfilesPosting: false,
  exportProfilesPostingError: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_EXPORT_UI: {
      const shouldShow = action.payload.shouldShow
      return { ...state, shouldShow }
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
