import {
  LOAD_FRAMES,
  LOAD_FRAMES_ERROR,
  LOAD_FRAMES_SUCCESS
} from '../constants/actionTypes'
import api from '../api'

export function getFrames (flipbookClipAssetId) {
  return dispatch => {
    dispatch({
      type: LOAD_FRAMES
    })

    api
      .flipbook
      .get(flipbookClipAssetId)
      .then(response => {
        dispatch({
          type: LOAD_FRAMES_SUCCESS,
          payload: response
        })
      }, errorResponse => {
        dispatch({
          type: LOAD_FRAMES_ERROR,
          payload: errorResponse.data
        })
      })
  }
}
