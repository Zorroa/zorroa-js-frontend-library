import { ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET, SELECT_ASSETS } from '../constants/actionTypes'

function inject (src, idx, arr) {
  idx = Math.min(idx, src.length)
  let seen = new Set()
  let dupeCount = 0
  let injected = []

  var copyChunk = (a, first, last) => {
    for (let i = first; i < last; i++) {
      if (!seen.has(a[i].id)) {
        injected.push(a[i])
        seen.add(a[i].id)
      } else {
        dupeCount++
      }
    }
  }

  copyChunk(src, 0, idx)
  copyChunk(arr, 0, arr.length)
  copyChunk(src, idx, src.length)

  if (dupeCount) {
    console.error(`WARNING ${dupeCount} duplicate asset ids present`)
  }

  return injected
}

export default function (state = {}, action) {
  switch (action.type) {
    case ASSET_SEARCH:
      const { query, assets, page } = action.payload
      const all = state.all && page && page.from ? inject(state.all, page.from, assets) : assets
      const totalCount = page && page.totalCount ? page.totalCount : 0
      const selectedIds = page && page.from ? state.selectedIds : null
      return { ...state, all, query, totalCount, selectedIds, isolatedId: null }
    case ASSET_SEARCH_ERROR:
      return { ...state, error: action.payload }
    case ISOLATE_ASSET:
      return { ...state, isolatedId: action.payload }
    case SELECT_ASSETS:
      return { ...state, selectedIds: action.payload }
  }

  return state
}
