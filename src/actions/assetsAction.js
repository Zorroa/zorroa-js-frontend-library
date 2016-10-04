import axios from 'axios'

import { ASSET_SEARCH, ASSET_SEARCH_ERROR } from '../constants/actionTypes'
import Asset from '../models/Asset'

const baseURL = 'https://localhost:8066'
const archivist = axios.create({
  baseURL,
  withCredentials: true
})

export function searchAssets (query) {
  return dispatch => {
    console.log('Search: ' + query)
    archivist.post('/api/v3/assets/_search', {query})
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
        dispatch({
          type: ASSET_SEARCH_ERROR,
          payload: error
        })
      })
  }
}
