import {
  ASSET_SEARCH, ASSET_SEARCH_ERROR, ASSET_SORT, ASSET_FIELDS,
  PAGE_SIZE, ISOLATE_ASSET, SELECT_ASSETS, SUGGEST_COMPLETIONS, UNAUTH_USER
} from '../constants/actionTypes'

import AssetSearch from '../models/AssetSearch'

const initialState = {
  pageSize: AssetSearch.defaultPageSize,

  // selectionCounter increments whenever the selection changes. The value itself has no meaning.
  // This is used to trigger any changes that need to respond to the selection. (See Assets, Table)
  selectionCounter: 0
}

function inject (src, idx, arr) {
  if (PROD || PRODLOCAL) {
    return src.slice(0, idx).concat(arr).concat(src.slice(idx))
  }

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

export default function (state = initialState, action) {
  switch (action.type) {
    case ASSET_SEARCH: {
      const { query, assets, page, aggs } = action.payload
      const all = state.all && page && page.from ? inject(state.all, page.from, assets) : assets
      const totalCount = page && page.totalCount ? page.totalCount : 0
      return { ...state, all, aggs, query, totalCount, isolatedId: null, suggestions: null }
    }

    case ASSET_SEARCH_ERROR:
      return { ...state, error: action.payload }

    case ASSET_SORT: {
      const { field, ascending } = action.payload
      let order = state.order ? [ ...state.order ] : []
      const index = state.order && state.order.findIndex(order => (order.field === field))
      if (index >= 0) order.splice(index, 1)  // remove if order===undefined, re-order otherwise
      if (ascending !== undefined) {
        // add as primary sort and crop list to max count
        order.unshift(action.payload)
        const maxOrder = 3
        order = order.slice(0, maxOrder)
      }
      return { ...state, order }
    }

    case ASSET_FIELDS:
      return { ...state, fields: action.payload }

    case ISOLATE_ASSET:
      return { ...state, isolatedId: action.payload }

    case SELECT_ASSETS: {
      const selectionCounter = state.selectionCounter + 1
      return { ...state, selectedIds: action.payload, selectionCounter }
    }

    case PAGE_SIZE:
      return { ...state, pageSize: action.payload }

    case SUGGEST_COMPLETIONS:
      return { ...state, suggestions: action.payload }

    case UNAUTH_USER:
      return initialState
  }

  return state
}
