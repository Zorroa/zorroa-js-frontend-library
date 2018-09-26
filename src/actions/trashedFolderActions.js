import {
  TRASHED_FOLDERS,
  RESTORE_TRASHED_FOLDERS,
  DELETE_TRASHED_FOLDERS,
  EMPTY_FOLDER_TRASH,
  COUNT_TRASHED_FOLDERS,
} from '../constants/actionTypes'
import TrashedFolder from '../models/TrashedFolder'
import { archivistGet, archivistPost, archivistRequest } from './authAction'

const rootEndpoint = '/api/v1/trash'

export function getTrashedFolders() {
  return dispatch => {
    return archivistGet(dispatch, `${rootEndpoint}`)
      .then(response => {
        const trashedFolders = response.data.map(
          json => new TrashedFolder(json),
        )
        return dispatch({
          type: TRASHED_FOLDERS,
          payload: trashedFolders,
        })
      })
      .catch(error => {
        console.error('Error getting trashed folders: ' + error)
      })
  }
}

export function restoreTrashedFolders(ids) {
  return dispatch => {
    console.log('Restore trashed folder ' + JSON.stringify(ids))
    return archivistPost(dispatch, `${rootEndpoint}/_restore`, ids)
      .then(response => {
        return dispatch({
          type: RESTORE_TRASHED_FOLDERS,
          payload: ids,
        })
      })
      .catch(error => {
        console.log(
          'Error restoring folder ' + JSON.stringify(ids) + ': ' + error,
        )
      })
  }
}

export function deleteTrashedFolders(ids) {
  return dispatch => {
    console.log('Delete trashed folder ' + JSON.stringify(ids))
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'delete',
      url: rootEndpoint,
      data: ids,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
    return archivistRequest(dispatch, request)
      .then(response => {
        return dispatch({
          type: DELETE_TRASHED_FOLDERS,
          payload: ids,
        })
      })
      .catch(error => {
        console.log(
          'Error restoring folder ' + JSON.stringify(ids) + ': ' + error,
        )
      })
  }
}

export function emptyFolderTrash() {
  return dispatch => {
    console.log('Empty trash')
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'delete',
      url: rootEndpoint,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
    return archivistRequest(dispatch, request)
      .then(response => {
        return dispatch({
          type: EMPTY_FOLDER_TRASH,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error emptying trash: ' + error)
      })
  }
}

export function countTrashedFolders() {
  return dispatch => {
    return archivistGet(dispatch, `${rootEndpoint}/_count`)
      .then(response => {
        return dispatch({
          type: COUNT_TRASHED_FOLDERS,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error counting trashed folders: ' + error)
      })
  }
}
