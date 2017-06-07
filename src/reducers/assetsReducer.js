import {
  ASSET_SEARCH, ASSET_AGGS, ASSET_SEARCH_ERROR,
  ASSET_SORT, ASSET_ORDER, ASSET_FIELDS,
  SIMILAR_VALUES, SIMILAR_ASSETS,
  ASSET_PERMISSIONS, UPDATE_COMMAND, GET_COMMANDS,
  ISOLATE_ASSET, SELECT_ASSETS, SELECT_PAGES,
  ADD_ASSETS_TO_FOLDER, REMOVE_ASSETS_FROM_FOLDER,
  SUGGEST_COMPLETIONS, SEARCH_DOCUMENT, UNAUTH_USER
} from '../constants/actionTypes'

import * as api from '../globals/api.js'
import Asset from '../models/Asset'
import AssetSearch from '../models/AssetSearch'

const initialState = {
  // These "counters" increment whenever the query or selection changes.
  // The value itself has no meaning, these are used to respond to query
  // or selection changes. (See Assets & Table for examples)
  assetsCounter: 0,
  selectionCounter: 0,
  commands: new Map(),
  similar: []
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
      const { query, assets, page } = action.payload
      const all = state.all && page && page.from ? inject(state.all, page.from, assets) : assets
      const totalCount = page && page.totalCount ? page.totalCount : 0
      const assetsCounter = state.assetsCounter + 1
      api.setAssetsCounter(assetsCounter)
      return { ...state, all, query, totalCount, suggestions: null, assetsCounter, error: null }
    }

    case ASSET_AGGS: {
      const { aggs } = action.payload
      return { ...state, aggs }
    }

    case SEARCH_DOCUMENT: {
      return { ...state, pages: action.payload }
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
      return { ...state, order, similar: [] }
    }

    case ASSET_ORDER:
      return { ...state, order: action.payload, similar: [] }

    case SIMILAR_VALUES:
      const hashes = action.payload
      if (hashes.length) return { ...state, order: null }
      break

    case SIMILAR_ASSETS:
      return { ...state, similar: action.payload }

    case ASSET_FIELDS: {
      const fields = action.payload
      const types = {}
      Object.keys(fields).forEach(type => { fields[type].forEach(field => { types[field] = type }) })
      return { ...state, fields, types }
    }

    case ISOLATE_ASSET:
      return { ...state, isolatedId: action.payload, pages: action.payload ? state.pages : null }

    case SELECT_ASSETS: {
      const selectionCounter = state.selectionCounter + 1
      api.setSelectionCounter(selectionCounter)
      return { ...state, selectedIds: action.payload, selectionCounter }
    }

    case SELECT_PAGES:
      return { ...state, selectedPageIds: action.payload }

    case SUGGEST_COMPLETIONS:
      return { ...state, suggestions: action.payload }

    case ADD_ASSETS_TO_FOLDER: {
      // Update the asset's folder list so asset-in-folder checks work
      const { folderId } = action.payload
      const all = [...state.all]
      const assetIds = action.payload.data.success
      assetIds.forEach(id => {
        const index = all.findIndex(asset => (asset.id === id))
        if (index >= 0) {
          const asset = new Asset(all[index])
          asset.addFolderIds([folderId])
          all[index] = asset
        }
      })

      // Flush the query cache if one of the selected folders was modified
      let query = state.query
      if (query && query.filter && query.filter.links && query.filter.links.folder) {
        const index = query.filter.links.folder.findIndex(id => (id === folderId))
        if (index >= 0) {
          query = new AssetSearch(query)
          query.filter.links.folder = null
        }
      }
      return { ...state, all, query }
    }

    case REMOVE_ASSETS_FROM_FOLDER: {
      // Update the asset's folder list so asset-in-folder checks work
      const { folderId } = action.payload
      const all = [...state.all]
      const assetIds = action.payload.data.success
      assetIds.forEach(id => {
        const index = all.findIndex(asset => (asset.id === id))
        if (index >= 0) {
          const asset = new Asset(all[index])
          asset.removeFolderIds([folderId])
          all[index] = asset
        }
      })

      // Flush the query cache if one of the selected folders was modified
      let query = state.query
      if (query && query.filter && query.filter.links && query.filter.links.folder) {
        const index = query.filter.links.folder.findIndex(id => (id === folderId))
        if (index >= 0) {
          query = new AssetSearch(query)
          query.filter.links.folder = null
        }
      }
      return { ...state, all, query }
    }

    case UPDATE_COMMAND:        // Same reduction action for update
    case ASSET_PERMISSIONS: {
      const command = action.payload
      const commands = new Map(state.commands)
      commands.set(command.id, command)
      return { ...state, commands }
    }

    case GET_COMMANDS: {
      const commands = action.payload
      return { ...state, commands }
    }
    case UNAUTH_USER:
      return initialState
  }

  return state
}
