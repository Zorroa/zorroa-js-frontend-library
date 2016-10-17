import { GET_FOLDER_CHILDREN } from '../constants/actionTypes'
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
        console.log('Error getting folder: ' + error)
      })
  }
}
