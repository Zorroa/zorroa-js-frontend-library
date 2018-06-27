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
import SharedTableLayout from '../models/SharedTableLayout'

const initialState = {
  sharedTableLayouts: [],
  isFetchingSharedTableLayouts: false,
  isFetchingSharedTableLayoutsError: false,
  isFetchingSharedTableLayoutsErrorMessage: '',
  isSavingSharedTableLayouts: {},
  isSavingSharedTableLayoutsError: {},
  isSavingSharedTableLayoutsSuccess: {},
  isDeletingSharedTable: false,
  isDeletingSharedTableError: false,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_TABLE_LAYOUT: {
      const isFetchingSharedTableLayouts = true
      const isFetchingSharedTableLayoutsError = false
      return {
        ...state,
        isFetchingSharedTableLayouts,
        isFetchingSharedTableLayoutsError,
      }
    }
    case FETCH_TABLE_LAYOUT_SUCCESS: {
      const isFetchingSharedTableLayouts = false
      const isFetchingSharedTableLayoutsError = false
      const sharedTableLayouts = action.payload.map(
        layout => new SharedTableLayout(layout),
      )

      return {
        ...state,
        sharedTableLayouts,
        isFetchingSharedTableLayouts,
        isFetchingSharedTableLayoutsError,
      }
    }
    case FETCH_TABLE_LAYOUT_ERROR: {
      const defaultErrorMessage = 'Unable to load table layouts'
      const isFetchingSharedTableLayouts = false
      const isFetchingSharedTableLayoutsError = true
      const isSavingSharedTableLayoutsErrorMessage =
        action.payload.message || defaultErrorMessage
      const sharedTableLayouts = []
      return {
        ...state,
        sharedTableLayouts,
        isFetchingSharedTableLayouts,
        isFetchingSharedTableLayoutsError,
        isSavingSharedTableLayoutsErrorMessage,
      }
    }
    case SHARE_TABLE_LAYOUT: {
      const { layoutId } = action.payload
      const isSavingSharedTableLayouts = {
        ...isSavingSharedTableLayouts,
        [layoutId]: true,
      }
      const isSavingSharedTableLayoutsSuccess = {
        ...isSavingSharedTableLayoutsSuccess,
        [layoutId]: false,
      }
      const isSavingSharedTableLayoutsError = {
        ...isSavingSharedTableLayoutsError,
        [layoutId]: false,
      }

      return {
        ...state,
        isSavingSharedTableLayoutsSuccess,
        isSavingSharedTableLayoutsError,
        isSavingSharedTableLayouts,
      }
    }
    case SHARE_TABLE_LAYOUT_SUCCESS: {
      const { layoutId } = action.payload
      const isSavingSharedTableLayouts = {
        ...state.isSavingSharedTableLayouts,
        [layoutId]: false,
      }
      const isSavingSharedTableLayoutsSuccess = {
        ...state.isSavingSharedTableLayoutsSuccess,
        [layoutId]: true,
      }
      const isSavingSharedTableLayoutsError = {
        ...state.isSavingSharedTableLayoutsError,
        [layoutId]: false,
      }

      return {
        ...state,
        isSavingSharedTableLayouts,
        isSavingSharedTableLayoutsSuccess,
        isSavingSharedTableLayoutsError,
      }
    }
    case SHARE_TABLE_LAYOUT_ERROR: {
      const { layoutId } = action.payload
      const isSavingSharedTableLayouts = {
        ...state.isSavingSharedTableLayouts,
        [layoutId]: false,
      }
      const isSavingSharedTableLayoutsSuccess = {
        ...state.isSavingSharedTableLayoutsSuccess,
        [layoutId]: false,
      }
      const isSavingSharedTableLayoutsError = {
        ...state.isSavingSharedTableLayoutsError,
        [layoutId]: true,
      }

      return {
        ...state,
        isSavingSharedTableLayouts,
        isSavingSharedTableLayoutsSuccess,
        isSavingSharedTableLayoutsError,
      }
    }
    case DELETE_SHARED_TABLE_LAYOUT: {
      const isDeletingSharedTable = true
      const isDeletingSharedTableError = false

      return {
        ...state,
        isDeletingSharedTable,
        isDeletingSharedTableError,
      }
    }
    case DELETE_SHARED_LAYOUT_SUCCESS: {
      const isDeletingSharedTable = false
      const isDeletingSharedTableError = false
      const { layoutBlobName, layoutBlobId } = action.payload
      const layoutsWithoutDeletedItems =
        state.sharedTableLayouts.filter(sharedLayout => {
          return sharedLayout.getBlobName() !== layoutBlobName
        }) || []
      const isSavingSharedTableLayoutsSuccess = {
        ...state.isSavingSharedTableLayoutsSuccess,
        [layoutBlobId]: false,
      }
      const isSavingSharedTableLayoutsError = {
        ...state.isSavingSharedTableLayoutsError,
        [layoutBlobId]: false,
      }

      return {
        ...state,
        sharedTableLayouts: layoutsWithoutDeletedItems,
        isDeletingSharedTable,
        isDeletingSharedTableError,
        isSavingSharedTableLayoutsSuccess,
        isSavingSharedTableLayoutsError,
      }
    }
    case DELETE_SHARED_TABLE_LAYOUT_ERROR: {
      const isDeletingSharedTable = false
      const isDeletingSharedTableError = true

      return {
        ...state,
        isDeletingSharedTable,
        isDeletingSharedTableError,
      }
    }
  }

  return state
}
