import {
  UPDATE_EXPORT_UI
} from '../constants/actionTypes'

export const initialState = {
  shouldShow: true // TODO set this to false before releasing
}

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_EXPORT_UI: {
      const shouldShow = action.payload.shouldShow
      return { ...state, shouldShow }
    }
  }

  return state
}
