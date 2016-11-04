import * as assert from 'assert'

import { UNAUTH_USER, ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET, SELECT_ASSETS, PAGE_SIZE } from '../constants/actionTypes'
import Asset from '../models/Asset'
import Page from '../models/Page'
import AssetSearch from '../models/AssetSearch'
import { getArchivist } from './authAction'

export function searchAssets (query) {
  assert.ok(query instanceof AssetSearch)
  assert.ok(query.size)
  return dispatch => {
    console.log('Search: ' + JSON.stringify(query))
    assert.ok(typeof query.from === 'undefined' || query.from >= 0)
    getArchivist().post('/api/v3/assets/_search', query)
      .then(response => {
        console.log('Query ' + JSON.stringify(query))
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
