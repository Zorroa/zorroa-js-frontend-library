import * as assert from 'assert'

import {
  UNAUTH_USER, ASSET_SEARCH, ASSET_SEARCH_ERROR,
  ASSET_SORT, ASSET_ORDER, ASSET_FIELDS,
  ISOLATE_ASSET, SELECT_ASSETS, PAGE_SIZE, SUGGEST_COMPLETIONS
} from '../constants/actionTypes'
import Asset from '../models/Asset'
import Page from '../models/Page'
import AssetSearch from '../models/AssetSearch'
import { getArchivist } from './authAction'

export function searchAssets (query) {
  assert.ok(query instanceof AssetSearch)
  assert.ok(query.size)
  return dispatch => {
    assert.ok(typeof query.from === 'undefined' || query.from >= 0)
    // Escape special characters
    // https://www.elastic.co/guide/en/elasticsearch/reference/2.1/query-dsl-query-string-query.html#_reserved_characters
    let safeQuery = { ...query }
    if (safeQuery.query) {
      safeQuery.query = safeQuery.query.replace(/(\+|\-|\=|\&\&|\|\||\>|\<|\!|\(|\)|\{|\}|\[|\]|\^|\"|\~|\*|\?|\:|\\|\/)/g, '\\$&')
    }
    console.log('Search: ' + JSON.stringify(safeQuery))
    getArchivist().post('/api/v3/assets/_search', safeQuery)
      .then(response => {
        console.log('Query ' + JSON.stringify(safeQuery))
        console.log(response)
        const page = new Page(response.data.page)
        const assets = response.data.list.map(asset => (new Asset(asset)))
        const aggs = response.data.aggregations
        dispatch({
          type: ASSET_SEARCH,
          payload: { query, assets, page, aggs }
        })
      })
      .catch(error => {
        console.error('Error searching for assets: ' + error)
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

export function suggestQueryStrings (text) {
  if (!text) {
    return ({ type: SUGGEST_COMPLETIONS, payload: null })
  }
  return dispatch => {
    getArchivist().post('/api/v2/assets/_suggest', {text})
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
  return ({ type: ASSET_SORT, payload: {field, ascending} })
}

export function orderAssets (order) {
  return ({ type: ASSET_ORDER, payload: order })
}

export function unorderAssets () {
  return orderAssets([])
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

export function setPageSize (count) {
  return ({
    type: PAGE_SIZE,
    payload: count
  })
}

export function getAssetFields () {
  return dispatch => {
    getArchivist().get('/api/v1/assets/_fields')
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
