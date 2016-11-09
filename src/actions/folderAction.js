import { GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, DELETE_FOLDER } from '../constants/actionTypes'
import Folder from '../models/Folder'
import { getArchivist } from './authAction'

const rootEndpoint = '/api/v1/folders'

export function getFolderChildren (id) {
  if (id < 0) {             // Catch "fake" folders, if used
    return dispatch => {}
  }
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

export function createFolder (name, parentId) {
  return dispatch => {
    console.log('Create folder ' + name + ' + parent=' + parentId)
    const folder = new Folder({ name, parentId })
    getArchivist().post(`${rootEndpoint}`, folder)
      .then(response => {
        dispatch({
          type: CREATE_FOLDER,
          payload: new Folder(response.data)
        })
      })
      .catch(error => {
        console.error('Error creating folder ' + name + ' parent=' + parentId + ': ' + error)
      })
  }
}

export function deleteFolderIds (ids) {
  return dispatch => {
    for (let id of ids) {
      console.log('Delete folder ' + id)
      getArchivist().delete(`${rootEndpoint}/${id}`)
        .then(response => {
          dispatch({
            type: DELETE_FOLDER,
            payload: id
          })
        })
        .catch(error => {
          console.error('Error deleting folder ' + id + ': ' + error)
        })
    }
  }
}
