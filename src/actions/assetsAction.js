import { UNAUTH_USER, ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET } from '../constants/actionTypes'
import Asset from '../models/Asset'
import { getArchivist } from './authAction'

export function searchAssets (query) {
  return dispatch => {
    console.log('Search: ' + query)
    getArchivist().post('/api/v3/assets/_search', {query})
      .then(response => {
        console.log('Query ' + query)
        console.log(response)
        const assets = response.data.list.map(asset => (new Asset(asset)))
        dispatch({
          type: ASSET_SEARCH,
          payload: assets
        })
      })
      .catch(error => {
        console.log('Error searching for assets: ' + error)
        if (error.response.status === 401) {
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
