import { ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET } from '../constants/actionTypes'

function inject (src, idx, arr) {
  return src.slice(0, idx).concat(arr).concat(src.slice(idx))
}

export default function (state = {}, action) {
  switch (action.type) {
    case ASSET_SEARCH:
      const { query, assets, page } = action.payload
      const all = state.all && page && page.from ? inject(state.all, page.from, assets) : assets
      const totalCount = page && page.totalCount ? page.totalCount : 0
      return { ...state, all, query, totalCount, isolatedId: null }
    case ASSET_SEARCH_ERROR:
      return { ...state, error: action.payload }
    case ISOLATE_ASSET:
      return { ...state, isolatedId: action.payload }
  }

  return state
}
