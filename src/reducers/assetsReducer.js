import {
  ASSET_SEARCH, ASSET_AGGS, ASSET_SEARCH_ERROR,
  ASSET_SORT, ASSET_ORDER, ASSET_FIELDS,
  SIMILAR_VALUES, SIMILAR_ASSETS,
  ASSET_PERMISSIONS, ASSET_SEARCHING,
  UPDATE_COMMAND, GET_COMMANDS,
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
  searching: false,
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
      // Collapsed Loading
      //
      // Loading of child pages is optimized for multipage display.
      // We start by computing a parentCount agg for all assets in the search.
      // Each time we load a page, we find the child pages and filter them and
      // their siblings out from the next page load, and display the parentCount
      // on top of the thumbnail stack for each grouped asset.
      // This implies we need to re-search when switching between multipage
      // and single-page mode so we do not filter out pages in single-page mode.
      //
      // This results in a different search for each page, and hence a different
      // totalCount and different "from" location for the next page.
      //
      // 1st search gives us the totalCount of all child pages and the parentCount agg.
      // Nth search gives a filteredCount and new child pages (parentIds).
      //
      // The loadedCount tells us where to start the next page (from) and
      // when we are finished loading all of the pages, used in Header/Assets.
      // From starts at zero for the 1st search. Then we subtract out the filtered
      // count from the new page by subtracting the "collapsed" count of siblings
      // in the first page that have parents, done while we construct parentIds.
      // We know that only "new" children will be added each time.
      //
      // We are done loading when loadedCount == filteredCount (not totalCount!)
      // The filteredCount is the final number of visible items.
      //
      // The global asset array is different in multipage and regular mode.
      // In multipage mode, we only store the first N children of a parent,
      // so they can be displayed in the thumb stack.
      //
      const { query, assets, page, multipage } = action.payload
      let collapsedCount = 0
      const maxStackCount = 3
      const parents = multipage ? (page && page.from ? new Map(state.parents) : new Map()) : undefined
      const collapsedAssets = multipage ? [] : assets
      if (multipage) {
        assets.forEach(asset => {
          if (asset.parentId()) {
            const parent = parents.get(asset.parentId())
            if (parent) {
              if (parent.count === undefined) {
                parent.count = 0
              }
              if (parent.count < maxStackCount) {
                collapsedAssets.push(asset)
              }
              parent.count++
            } else {
              collapsedAssets.push(asset)
              parents.set(asset.parentId(), {count: 1})
            }
          } else {
            collapsedAssets.push(asset)
          }
        })
        // FIXME: No need for second pass, compute differences of parent.count, requires deep copy?
        assets.forEach(asset => {
          if (asset.parentId()) {
            const parent = parents.get(asset.parentId())
            if (parent && parent.count >= maxStackCount) collapsedCount++
          }
        })
      }
      const all = state.all && page && page.from ? state.all.concat(collapsedAssets) : collapsedAssets
      const loadedCount = page && page.from + assets.length - collapsedCount
      const filteredCount = page && page.totalCount || 0
      const totalCount = page && page.totalCount && !page.from ? page.totalCount : state.totalCount
      console.log('loadedCount=' + loadedCount + ', collapsed=' + collapsedCount + ', filtered=' + filteredCount + ', totalCount=' + totalCount)
      const assetsCounter = state.assetsCounter + 1
      api.setAssetsCounter(assetsCounter)
      return { ...state, all, query, totalCount, filteredCount, loadedCount, parents, suggestions: null, assetsCounter, error: null }
    }

    case ASSET_AGGS: {
      const { aggs } = action.payload
      if (aggs.parentCounts) {
        const parents = new Map(state.parents)
        aggs.parentCounts.parentCounts.buckets.forEach(bucket => {
          const parent = parents.get(bucket.key)
          if (parent) {
            parent.total = bucket.doc_count
          } else {
            parents.set(bucket.key, {total: bucket.doc_count})
          }
        })
        return { ...state, aggs, parents }
      }
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
      if (action.payload) {
        const hashes = action.payload.values
        if (hashes.length) return { ...state, order: null }
      }
      break

    case SIMILAR_ASSETS:
      return { ...state, similar: action.payload }

    case ASSET_FIELDS: {
      const fields = action.payload
      const types = {}
      Object.keys(fields).forEach(type => { fields[type].forEach(field => { types[field] = type }) })
      return { ...state, fields, types }
    }

    case ASSET_SEARCHING:
      return { ...state, searching: action.payload }

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
