import * as assert from 'assert'

import {
  UNAUTH_USER, ASSET_SEARCH, ASSET_AGGS, ASSET_SEARCH_ERROR,
  ASSET_SORT, ASSET_ORDER, ASSET_FIELDS,
  ISOLATE_ASSET, SELECT_ASSETS,
  SELECT_PAGES,
  SUGGEST_COMPLETIONS, SEARCH_DOCUMENT
} from '../constants/actionTypes'
import Asset from '../models/Asset'
import Page from '../models/Page'
import AssetSearch from '../models/AssetSearch'
import AssetFilter from '../models/AssetFilter'
import { archivistGet, archivistPost } from './authAction'

function escapeQuery (query) {
  if (!query) return new AssetSearch()
  // Escape special characters
  // https://www.elastic.co/guide/en/elasticsearch/reference/2.1/query-dsl-query-string-query.html#_reserved_characters
  let safeQuery = new AssetSearch(query)
  if (safeQuery.query) {
    safeQuery.query = safeQuery.query.replace(/(\+|\-|=|&&|\|\||>|<|!|\(|\)|\{|\}|\[|\]|\^|"|~|\*|\?|:|\\|\/)/g, '\\$&')
  }
  return safeQuery
}

export function searchAssetsRequestProm (dispatch, query) {
  assert.ok(query instanceof AssetSearch)
  assert.ok(query.size)
  assert.ok(typeof query.from === 'undefined' || query.from >= 0)
  const safeQuery = escapeQuery(query)
  console.log('Search: ' + JSON.stringify(safeQuery))

  return archivistPost(dispatch, '/api/v3/assets/_search', safeQuery)
  .then(response => {
    console.log('Query ' + JSON.stringify(safeQuery))
    console.log(response)
    return response
  })
  .catch(error => {
    console.error('Error searching for assets', error)
    if (DEBUG) {
      if (error.response && error.response.data && error.response.data.message) {
        console.error('You have mail: ', error.response.data.message)
      }
    }
    return Promise.reject(error) // re-throw the error, so downstream can catch
  })
}

export function searchAssets (query, lastQuery) {
  return dispatch => {
    const promises = []
    const mainQueryChanged = !lastQuery || query.query !== lastQuery.query || query.filter !== lastQuery.filter
    const postFilterChanged = query.postFilter && !query.postFilter.empty() && (!lastQuery.postFilter || query.postFilter !== lastQuery.postFilter)
    if (mainQueryChanged || postFilterChanged) {
      const mainQuery = new AssetSearch(query)
      mainQuery.aggs = null
      mainQuery.postFilter = null
      if (query.filter && query.postFilter) {
        mainQuery.filter.merge(query.postFilter)
      } else if (query.postFilter) {
        mainQuery.filter = query.postFilter
      }
      promises.push(searchAssetsRequestProm(dispatch, mainQuery))
    }
    const aggsChanged = !lastQuery || !lastQuery.aggs || JSON.stringify(query.aggs) !== JSON.stringify(lastQuery.aggs)
    if (!query.from /* first page only */ && query.aggs && (mainQueryChanged || aggsChanged)) {
      const aggQuery = new AssetSearch(query)
      aggQuery.postFilter = null
      aggQuery.from = 0
      aggQuery.size = 1
      promises.push(searchAssetsRequestProm(dispatch, aggQuery))
    }
    return Promise.all(promises)
    .then(responses => {
      responses.forEach(response => {
        if (response.data.aggregations) {
          const aggs = response.data.aggregations
          dispatch({
            type: ASSET_AGGS,
            payload: { aggs }
          })
        } else {
          const page = new Page(response.data.page)
          const assets = response.data.list.map(asset => (new Asset(asset)))
          dispatch({
            type: ASSET_SEARCH,
            payload: { query, assets, page }
          })
        }
      })
    })
    .catch(error => {
      if (error.response && error.response.status === 401) {
        dispatch({
          type: UNAUTH_USER,
          payload: error.response.data
        })
      }
      dispatch({
        type: ASSET_SEARCH_ERROR,
        payload: error
      })
    })
  }
}

export function searchDocument (query, parentId, order) {
  assert.ok(!query || query instanceof AssetSearch)
  return dispatch => {
    const safeQuery = escapeQuery(query)
    const filter = new AssetFilter({terms: {'source.clip.parent.raw': [parentId]}})
    if (safeQuery.filter) {
      safeQuery.filter.merge(filter)
    } else {
      safeQuery.filter = filter
    }
    safeQuery.size = 10000
    safeQuery.from = 0
    if (!query) safeQuery.order = order
    console.log('Search Document: ' + JSON.stringify(safeQuery))
    archivistPost(dispatch, '/api/v3/assets/_search', safeQuery)
      .then(response => {
        console.log('Query Document' + JSON.stringify(safeQuery))
        console.log(response)
        const assets = response.data.list.map(asset => (new Asset(asset)))
        dispatch({
          type: SEARCH_DOCUMENT,
          payload: assets
        })
      })
      .catch(error => {
        console.error('Error searching for assets: ' + error)
      })
  }
}
export function suggestQueryStrings (text) {
  if (!text) {
    return ({ type: SUGGEST_COMPLETIONS, payload: null })
  }
  return dispatch => {
    archivistPost(dispatch, '/api/v2/assets/_suggest', {text})
      .then(response => {
        const suggestions = response.data.completions[0].options
        dispatch({
          type: SUGGEST_COMPLETIONS,
          payload: suggestions
        })
      })
      .catch(error => {
        console.error('Error requesting suggestions for ' + text + ': ' + error)
      })
  }
}

export function sortAssets (field, ascending) {
  if (!field || !field.length) return unorderAssets()
  return ({ type: ASSET_SORT, payload: {field, ascending} })
}

export function orderAssets (order) {
  return ({ type: ASSET_ORDER, payload: order })
}

export function unorderAssets () {
  return orderAssets()
}

export function isolateAssetId (id) {
  return ({
    type: ISOLATE_ASSET,
    payload: id
  })
}

export function selectAssetIds (ids) {
  return ({
    type: SELECT_ASSETS,
    payload: ids
  })
}

export function selectPageAssetIds (ids) {
  return ({
    type: SELECT_PAGES,
    payload: ids
  })
}

export function getAssetFields () {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/assets/_fields')
      .then(response => {
        dispatch({
          type: ASSET_FIELDS,
          payload: response.data
        })
      })
      .catch(error => {
        console.error('Error getting asset fields: ' + error)
      })
  }
}
