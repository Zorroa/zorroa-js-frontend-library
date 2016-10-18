import * as assert from 'assert'

import { UNAUTH_USER, ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET } from '../constants/actionTypes'
import Asset from '../models/Asset'
import Page from '../models/Page'
import { getArchivist } from './authAction'

export function searchAssets (query) {
  return dispatch => {
    // Wrap undefined or simple string queries as an AssetSearch
    if (!query || query instanceof String) {
      query = { query }
    }
    console.log('Search: ' + query)
    assert.ok(typeof query.page === 'undefined' || query.page > 0)
    getArchivist().post('/api/v3/assets/_search', query)
      .then(response => {
        console.log('Query ' + query)
        console.log(response)
        const page = new Page(response.data.page)
        const assets = response.data.list.map(asset => (new Asset(asset)))
        dispatch({
          type: ASSET_SEARCH,
          payload: { query, assets, page }
        })
      })
      .catch(error => {
        console.log('Error searching for assets: ' + error)
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
