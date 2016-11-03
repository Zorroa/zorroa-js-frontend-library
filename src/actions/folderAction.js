import { GET_FOLDER_CHILDREN, SELECT_FOLDERS } from '../constants/actionTypes'
import Folder from '../models/Folder'
import { getArchivist } from './authAction'

const rootEndpoint = '/api/v1/folders'

export function getFolderChildren (id) {
  return dispatch => {
    console.log('Load folder ' + id)
    getArchivist().get(`${rootEndpoint}/${id}/_children`)
      .then(response => {
        const children = response.data.map(folder => (new Folder(folder)))
        dispatch({
          type: GET_FOLDER_CHILDREN,
          payload: children
        })
      })
      .catch(error => {
        console.error('Error getting folder: ' + error)
      })
  }
}

export function selectFolderIds (ids) {
  return ({
    type: SELECT_FOLDERS,
    payload: ids
  })
}
