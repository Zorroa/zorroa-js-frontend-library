import { archivistGet, archivistPost } from './authAction'

const rootEndpoint = '/api/v1/shared_link'

export function saveSharedLink (assetSearch) {
  return dispatch => {
    return archivistPost(dispatch, `${rootEndpoint}`, {state: assetSearch})
    .then(response => response.data.id)
  }
}

export function loadSharedLink (searchId) {
  return dispatch => {
    return archivistGet(dispatch, `${rootEndpoint}/${searchId}`)
    .then(response => response.data.state)
  }
}
