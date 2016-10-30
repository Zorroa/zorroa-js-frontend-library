import * as assert from 'assert'

import { UNAUTH_USER, ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET, SELECT_ASSETS } from '../constants/actionTypes'
import Asset from '../models/Asset'
import Page from '../models/Page'
import { getArchivist } from './authAction'

export function searchAssets (query) {
  return dispatch => {
    // Wrap undefined or simple string queries as an AssetSearch
    if (!query || typeof query === 'string' || query instanceof String) {
      query = { query }
    }
    console.log('Search: ' + JSON.stringify(query))
    assert.ok(typeof query.from === 'undefined' || query.from >= 0)
    getArchivist().post('/api/v3/assets/_search', query)
      .then(response => {
        console.log('Query ' + JSON.stringify(query))
        console.log(response)
        const page = new Page(response.data.page)
        const assets = response.data.list.map(asset => (new Asset(asset)))
        dispatch({
          type: ASSET_SEARCH,
          payload: { query, assets, page }
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

export function isolateAsset (id) {
  return ({
    type: ISOLATE_ASSET,
    payload: id
  })
}

export function selectAssets (ids) {
  return ({
    type: SELECT_ASSETS,
    payload: ids
  })
}
