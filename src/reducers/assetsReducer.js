import { ASSET_SEARCH, ASSET_SEARCH_ERROR } from '../constants/actionTypes'

export default function (state = {}, action) {
  switch (action.type) {
    case ASSET_SEARCH:
      return { ...state, all: action.payload }
    case ASSET_SEARCH_ERROR:
      return { ...state, error: action.payload }
  }

  return state
}
