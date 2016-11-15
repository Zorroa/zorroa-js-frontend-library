import { GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, DELETE_FOLDER, ADD_ASSETS_TO_FOLDER, TOGGLE_FOLDER } from '../constants/actionTypes'
import Folder from '../models/Folder'
import { getArchivist } from './authAction'

const rootEndpoint = '/api/v1/folders'

export function toggleFolder (folderId, isOpen) {
  return dispatch => {
    console.log('Toggle Folder', folderId, isOpen)
    dispatch({
      type: TOGGLE_FOLDER,
      payload: { folderId, isOpen }
    })
  }
}

export function getFolderChildren (parentId) {
  if (parentId < Folder.ROOT_ID) {             // Catch "fake" folders, if used
    return dispatch => {}
  }
  return dispatch => {
    console.log('Load folder ' + parentId)
    getArchivist().get(`${rootEndpoint}/${parentId}/_children`)
      .then(response => {
        const children = response.data.map(folder => (new Folder(folder)))
        dispatch({
          type: GET_FOLDER_CHILDREN,
          payload: { parentId, children }
        })
      })
  }
}

export function selectFolderIds (ids) {
  if (!(ids instanceof Set)) ids = new Set(ids)
  return {
    type: SELECT_FOLDERS,
    payload: ids
  }
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

export function addAssetIdsToFolderId (assetIds, folderId) {
  return dispatch => {
    console.log('Add assets ' + JSON.stringify(assetIds) + ' to folder ' + folderId)
    getArchivist().post(`${rootEndpoint}/${folderId}/assets`, assetIds)
      .then(response => {
        dispatch({
          type: ADD_ASSETS_TO_FOLDER,
          payload: response.data
        })
      })
      .catch(error => {
        console.error('Error adding assets ' + JSON.stringify(assetIds) + ' to folder ' + folderId + ': ' + error)
      })
  }
}
