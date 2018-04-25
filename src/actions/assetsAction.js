import * as assert from 'assert'

import {
  UNAUTH_USER,
  ASSET_SEARCH,
  ASSET_AGGS,
  ASSET_SEARCH_ERROR,
  ASSET_SORT,
  ASSET_ORDER,
  ASSET_FIELDS,
  ASSET_PERMISSIONS,
  ASSET_SEARCHING,
  UPDATE_COMMAND,
  GET_COMMANDS,
  ISOLATE_ASSET,
  SELECT_ASSETS,
  ISOLATE_PARENT,
  ISOLATE_FLIPBOOK,
  DEISOLATE_FLIPBOOK,
  SUGGEST_COMPLETIONS,
  ALL_ASSET_COUNT,
  SIMILAR_FIELDS,
  ASSET_DELETE,
} from '../constants/actionTypes'
import Asset from '../models/Asset'
import Page from '../models/Page'
import Command from '../models/Command'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
import {
  archivistGet,
  archivistPut,
  archivistPost,
  archivistDelete,
} from './authAction'

export function requiredFields(fields, fieldTypes) {
  const required = [
    'id',
    'source.filename',
    'source.mediaType',
    'source.extension',
  ]
  const prefix = ['links', 'clip', 'media', 'pages', 'proxies']

  const req = new Set()
  req.add('*point')
  fieldTypes &&
    Object.keys(fieldTypes).forEach(field => {
      let addedPrefix = false
      for (let i = 0; i < prefix.length; ++i) {
        if (field.startsWith(prefix[i])) {
          req.add(`${prefix[i]}*`)
          addedPrefix = true
          break
        }
      }
      if (!addedPrefix) {
        let addedField = false
        for (let i = 0; i < required.length; ++i) {
          if (field === required[i]) {
            req.add(field)
            addedField = true
            break
          }
        }
        if (!addedField) {
          for (let i = 0; i < fields.length; ++i) {
            if (field === fields[i]) {
              req.add(field)
              break
            }
          }
        }
      }
    })
  return [...req]
}

export function searchAssetsRequestProm(dispatch, query) {
  assert.ok(query instanceof AssetSearch)
  assert.ok(query.size)
  assert.ok(typeof query.from === 'undefined' || query.from >= 0)
  console.log('Search: ' + JSON.stringify(query))

  return archivistPost(dispatch, '/api/v3/assets/_search', query)
    .then(response => {
      console.log('Query ' + JSON.stringify(query))
      console.log(response)
      return response
    })
    .catch(error => {
      console.error('Error searching for assets', error)
      if (DEBUG) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          console.error('You have mail: ', error.response.data.message)
        }
      }
      return Promise.reject(error) // re-throw the error, so downstream can catch
    })
}

export function countAssetsRequestProm(dispatch, query) {
  assert.ok(query instanceof AssetSearch)
  console.log('Count: ' + JSON.stringify(query))

  return archivistPost(dispatch, '/api/v2/assets/_count', query)
    .then(response => {
      console.log('Count query ' + JSON.stringify(query))
      console.log(response)
      return response
    })
    .catch(error => {
      console.error('Error counting assets', error)
      if (DEBUG) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          console.error('You have mail: ', error.response.data.message)
        }
      }
      return Promise.reject(error) // re-throw the error, so downstream can catch
    })
}

export function assetsForIds(assetIds, fields) {
  return new Promise(resolve => {
    const ids = [...assetIds]
    if (!ids || !ids.length) {
      throw new Error('Invalid fields for asset ids')
    }
    const filter = new AssetFilter({ terms: { _id: [...ids] } })
    const query = new AssetSearch({ filter, fields, size: ids.length })
    const dummyDispatch = () => {}
    searchAssetsRequestProm(dummyDispatch, query)
      .then(response => {
        resolve(response.data.list.map(json => new Asset(json)))
      })
      .catch(error => {
        console.error('Error finding assets for ids: ' + error)
      })
  })
}

export function isolateParent(asset) {
  return {
    type: ISOLATE_PARENT,
    payload: asset,
  }
}

export function isolateFlipbook(asset) {
  return {
    type: ISOLATE_FLIPBOOK,
    payload: asset,
  }
}

export function deisolateFlipbook() {
  return {
    type: DEISOLATE_FLIPBOOK,
  }
}

export function searchAssets(query, lastQuery, force, isFirstPage, parentIds) {
  return dispatch => {
    const promises = []
    const skip = new Set(['from', 'size', 'scroll', 'postFilter', 'aggs'])
    const mainQueryChanged =
      force || !lastQuery || !query.equals(lastQuery, skip)
    const postFilterChanged =
      force ||
      (query.postFilter &&
        lastQuery &&
        lastQuery.postFilter &&
        JSON.stringify(query.postFilter) !==
          JSON.stringify(lastQuery.postFilter)) ||
      (!query.postFilter &&
        lastQuery &&
        lastQuery.postFilter &&
        !lastQuery.postFilter.empty()) ||
      ((!lastQuery || !lastQuery.postFilter) &&
        query.postFilter &&
        !query.postFilter.empty())
    if (mainQueryChanged || postFilterChanged) {
      const mainQuery = new AssetSearch(query)
      mainQuery.aggs = null
      mainQuery.postFilter = null
      if (query.filter && query.postFilter) {
        mainQuery.filter.merge(query.postFilter)
      } else if (query.postFilter) {
        mainQuery.filter = new AssetFilter(query.postFilter)
      }

      // Filter out any child assets that have already been loaded after the first page
      if (!isFirstPage && parentIds && parentIds.length) {
        const filter = new AssetFilter({
          terms: { 'media.clip.parent': parentIds },
        })
        mainQuery.merge(
          new AssetSearch({ filter: new AssetFilter({ must_not: [filter] }) }),
        )
      }

      if (isFirstPage)
        requestAnimationFrame(_ => {
          dispatch({ type: ASSET_SEARCHING, payload: true })
        })
      promises.push(searchAssetsRequestProm(dispatch, mainQuery))
    }

    const aggsChanged =
      !lastQuery ||
      !lastQuery.aggs ||
      JSON.stringify(query.aggs) !== JSON.stringify(lastQuery.aggs)
    if (isFirstPage && query.aggs && (mainQueryChanged || aggsChanged)) {
      const aggQuery = new AssetSearch(query)
      aggQuery.postFilter = null
      aggQuery.from = 0
      aggQuery.size = 1
      aggQuery.fields = ['_id']
      aggQuery.order = null
      promises.push(searchAssetsRequestProm(dispatch, aggQuery))

      if (parentIds && parentIds.length) {
        promises.push(
          updateParentTotals(query, parentIds, {
            isUnfiltered: true,
          }),
        )
        promises.push(updateParentTotals(query, parentIds))
      }
    }

    return Promise.all(promises)
      .then(responses => {
        responses.forEach(response => {
          dispatch({ type: ASSET_SEARCHING, payload: false })
          if (response.data.aggregations) {
            const aggs = response.data.aggregations
            dispatch({
              type: ASSET_AGGS,
              payload: { aggs },
            })
          } else {
            const page = new Page(response.data.page)
            const assets = response.data.list.map(asset => new Asset(asset))
            dispatch({
              type: ASSET_SEARCH,
              payload: {
                query,
                assets,
                page,
                multipage: !!parentIds,
                isFirstPage,
              },
            })
          }
        })
      })
      .catch(error => {
        dispatch({ type: ASSET_SEARCHING, payload: false })
        if (error.response && error.response.status === 401) {
          dispatch({
            type: UNAUTH_USER,
            payload: error.response.data,
          })
        }
        dispatch({
          type: ASSET_SEARCH_ERROR,
          payload: error,
        })
      })
  }
}

export function updateParentTotals(query, parentIds, options = {}) {
  return dispatch => {
    const isUnfiltered = options.isUnfiltered === true

    if (parentIds && parentIds.length) {
      const aggQuery = new AssetSearch(query)
      if (aggQuery.postFilter) {
        if (aggQuery.filter) {
          aggQuery.filter.merge(query.postFilter)
        } else {
          aggQuery.filter = new AssetFilter(query.postFilter)
        }
      }
      const parentFilter = new AssetFilter({
        terms: { 'media.clip.parent': parentIds },
      })
      if (aggQuery.filter && isUnfiltered === false) {
        aggQuery.filter.merge(parentFilter)
      } else {
        aggQuery.filter = parentFilter
      }
      // Filter to children of visible parents
      const parentAggs = {
        parentCounts: { terms: { field: 'media.clip.parent', size: 1000 } },
      }
      aggQuery.merge(new AssetSearch({ aggs: parentAggs }))
      aggQuery.postFilter = null
      aggQuery.from = 0
      aggQuery.size = 1
      aggQuery.fields = ['_id']
      aggQuery.order = null

      searchAssetsRequestProm(dispatch, aggQuery)
        .then(response => {
          const aggs = response.data.aggregations
          const aggsKey = isUnfiltered ? 'unfilteredAggs' : 'aggs'
          dispatch({
            type: ASSET_AGGS,
            payload: { [aggsKey]: aggs },
          })
        })
        .catch(error => {
          console.log('Cannot get parent counts: ' + error)
        })
    }

    return { type: ASSET_AGGS, payload: { aggs: { parentCounts: null } } }
  }
}

export function suggestQueryStrings(text) {
  if (!text) {
    return { type: SUGGEST_COMPLETIONS, payload: null }
  }
  return dispatch => {
    archivistPost(dispatch, '/api/v3/assets/_suggest', { text })
      .then(response => {
        const suggestions = response.data
        dispatch({
          type: SUGGEST_COMPLETIONS,
          payload: suggestions,
        })
      })
      .catch(error => {
        console.error('Error requesting suggestions for ' + text + ': ' + error)
      })
  }
}

export function sortAssets(field, ascending, options = {}) {
  const silent = options.silent === true
  if (!field || !field.length) return unorderAssets()
  return {
    type: ASSET_SORT,
    payload: {
      field,
      ascending,
      silent,
    },
  }
}

export function orderAssets(order) {
  return { type: ASSET_ORDER, payload: order }
}

export function unorderAssets() {
  return orderAssets()
}

export function isolateAssetId(id, history) {
  if (history && id) {
    history.push(`/asset/${id}`)
  }
  return {
    type: ISOLATE_ASSET,
    payload: id,
  }
}

export function selectAssetIds(ids) {
  return {
    type: SELECT_ASSETS,
    payload: ids,
  }
}

export function getAssetFields() {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/assets/_fields')
      .then(response => {
        dispatch({
          type: ASSET_FIELDS,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting asset fields: ' + error)
      })
  }
}

export function findSimilarFields(assetFields) {
  if (!assetFields || !Object.keys(assetFields).length) {
    return {
      type: SIMILAR_FIELDS,
      payload: null,
    }
  }
  return dispatch => {
    let fields = []

    if (
      Array.isArray(assetFields.similarity) &&
      assetFields.similarity.length > 0
    ) {
      fields = fields.concat(assetFields.similarity)
    } else {
      dispatch({
        type: SIMILAR_FIELDS,
        payload: null,
      })
    }

    const aggs = {}
    fields.forEach(field => {
      aggs[field] = { filter: { exists: { field: field } } }
    })
    const query = new AssetSearch({
      aggs,
      size: 1,
      fields: ['source.basename'],
    })

    searchAssetsRequestProm(dispatch, query)
      .then(response => {
        dispatch({
          type: SIMILAR_FIELDS,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting similar counts: ' + error)
      })
  }
}

export function setAssetPermissions(search, acl) {
  return dispatch => {
    console.log(
      'Set asset permissions ' +
        JSON.stringify(acl) +
        '\non: ' +
        JSON.stringify(search),
    )
    archivistPut(dispatch, '/api/v1/assets/_permissions', { search, acl })
      .then(response => {
        dispatch({
          type: ASSET_PERMISSIONS,
          payload: new Command(response.data),
        })
      })
      .catch(error => {
        console.error(
          'Error setting acl ' +
            JSON.stringify(acl) +
            '\non: ' +
            JSON.stringify(search) +
            ': ' +
            error,
        )
      })
  }
}

export function updateCommand(id) {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/commands/' + id)
      .then(response => {
        dispatch({
          type: UPDATE_COMMAND,
          payload: new Command(response.data),
        })
      })
      .catch(error => {
        console.error('Error updating command ' + id + ': ' + error)
      })
  }
}

export function getAllCommands() {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/commands')
      .then(response => {
        const commands = new Map()
        response.data.forEach(json => {
          const command = new Command(json)
          commands.set(command.id, command)
        })
        dispatch({
          type: GET_COMMANDS,
          payload: commands,
        })
      })
      .catch(error => {
        console.error('Error getting commands: ' + error)
      })
  }
}

export function getAllAssetCount() {
  return dispatch => {
    countAssetsRequestProm(dispatch, new AssetSearch())
      .then(response => {
        dispatch({
          type: ALL_ASSET_COUNT,
          payload: response.data.count,
        })
      })
      .catch(error => {
        console.log('Error counting all assets: ' + error)
      })
  }
}

export function deleteAsset(assetId, folderId) {
  return dispatch => {
    return archivistDelete(dispatch, `/api/v1/assets/${assetId}`)
      .then(response => {
        dispatch({
          type: ASSET_DELETE,
          payload: { assetId, folderId, data: response.data },
        })
      })
      .catch(error => {
        console.error(`Error deleting assed ${assetId}`, error)
        return Promise.reject(error)
      })
  }
}
