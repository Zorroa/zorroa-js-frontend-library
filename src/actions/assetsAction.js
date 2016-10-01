import axios from 'axios'
import { ASSET_SEARCH, ASSET_SEARCH_ERROR } from '../constants/actionTypes'

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
        dispatch({
          type: ASSET_SEARCH,
          payload: response.data.list
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
