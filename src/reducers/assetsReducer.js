import { ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET } from '../constants/actionTypes'

export default function (state = {}, action) {
  switch (action.type) {
    case ASSET_SEARCH:
      return { ...state, all: action.payload, isolatedId: null }
    case ASSET_SEARCH_ERROR:
      return { ...state, error: action.payload }
    case ISOLATE_ASSET:
      return { ...state, isolatedId: action.payload }
  }

  return state
}
