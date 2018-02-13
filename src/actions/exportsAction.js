import {
  UPDATE_EXPORT_UI
} from '../constants/actionTypes'

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
