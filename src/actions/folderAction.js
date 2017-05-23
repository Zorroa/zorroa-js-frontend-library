import {
  GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, UPDATE_FOLDER,
  DELETE_FOLDER, TOGGLE_FOLDER, ADD_ASSETS_TO_FOLDER,
  REMOVE_ASSETS_FROM_FOLDER, FOLDER_COUNTS, QUEUE_FOLDER_COUNTS, CLEAR_FOLDER_COUNT_QUEUE
} from '../constants/actionTypes'
import Folder from '../models/Folder'
import { archivistGet, archivistPut, archivistPost, archivistRequest } from './authAction'
import { selectId } from '../services/jsUtil'

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

// Queue a load of the children for folder <parentId>
// pass optOnDoneFn optionally to receive a callback when the request is returned
// the request will be passed the list of children loaded
export function getFolderChildren (parentId, optOnDoneFn) {
  if (parentId < Folder.ROOT_ID) {             // Catch "fake" folders, if used
    return dispatch => { return Promise.resolve() }
  }
  return dispatch => {
    console.log('Load folder ' + parentId)
    return archivistGet(dispatch, `${rootEndpoint}/${parentId}/_children`)
      .then(response => {
        const children = response.data.map(folder => (new Folder(folder)))
        if (optOnDoneFn) optOnDoneFn(children)
        return dispatch({
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

// Works when folders is an array of either Folder or TrashedFolder so that
// we can share this logic without duplicating the TrashedFolder array into
// a Folder array each time we do selection, which would require dup+find.
// TrashedFolder.folderId is used instead of Folder.id rather than instanceof.
export function selectFolderId (id, shiftKey, metaKey, folders, selectedIds) {
  console.log('selectFolder')
  let selectedFolderIds = selectId(id, shiftKey, metaKey, folders, selectedIds)
  return selectFolderIds(selectedFolderIds)
}

export function createFolder (folder, assetIds) {
  return dispatch => {
    console.log('Create folder: ' + JSON.stringify(folder))
    archivistPost(dispatch, `${rootEndpoint}`, folder)
      .then(response => {
        const folder = new Folder(response.data)
        dispatch({
          type: CREATE_FOLDER,
          payload: folder
        })
        if (assetIds) {
          // Chain actions to add assets to newly created folder
          addAssetIdsToFolderIdProm(dispatch, assetIds, folder.id)
        }
      })
      .catch(error => {
        console.error('Error creating folder ' + folder.name + ': ' + error)
      })
  }
}

export function updateFolder (folder) {
  return dispatch => {
    console.log('Update folder: ' + JSON.stringify(folder))
    archivistPut(dispatch, `${rootEndpoint}/${folder.id}`, folder)
      .then(response => {
        dispatch({
          type: UPDATE_FOLDER,
          payload: new Folder(response.data)
        })
      })
      .catch(error => {
        console.error('Error updating folder ' + folder.name + ': ' + error)
      })
  }
}

export function deleteFolderIds (ids) {
  return dispatch => {
    for (let id of ids) {
      console.log('Delete folder ' + id)
      // Workaround CORS issue in OPTIONS preflight request for axios.delete
      const request = {
        method: 'delete',
        url: `${rootEndpoint}/${id}`,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      }
      archivistRequest(dispatch, request)
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
  return dispatch => addAssetIdsToFolderIdProm(dispatch, assetIds, folderId)
}

export function addAssetIdsToFolderIdProm (dispatch, assetIds, folderId) {
  if (assetIds instanceof Set) assetIds = [...assetIds]
  console.log('Add assets ' + JSON.stringify(assetIds) + ' to folder ' + folderId)
  return archivistPost(dispatch, `${rootEndpoint}/${folderId}/assets`, assetIds)
    .then(response => {
      dispatch({
        type: ADD_ASSETS_TO_FOLDER,
        payload: {assetIds, folderId, data: response.data}
      })
    })
    .catch(error => {
      console.error('Error adding assets ' + JSON.stringify(assetIds) + ' to folder ' + folderId + ': ' + error)
    })
}

export function removeAssetIdsFromFolderId (assetIds, folderId) {
  return dispatch => {
    if (assetIds instanceof Set) assetIds = [...assetIds]
    console.log('Remove assets ' + JSON.stringify(assetIds) + ' from folder ' + folderId)
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'delete',
      url: `${rootEndpoint}/${folderId}/assets`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      data: assetIds
    }
    archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: REMOVE_ASSETS_FROM_FOLDER,
          payload: {assetIds, folderId, data: response.data}
        })
      })
      .catch(error => {
        console.error('Error removing assets ' + JSON.stringify(assetIds) + ' from folder ' + folderId + ': ' + error)
      })
  }
}

// Setting folders visible means request folder counts
// For use outside of Searcher (in Folders); This will result in countAssetsInFolderIds
// being called with & without the current query, via Searcher
export function queueFolderCounts (ids) {
  if (!(ids instanceof Set)) ids = new Set(ids)
  return {
    type: QUEUE_FOLDER_COUNTS,
    payload: ids
  }
}

export function clearFolderCountQueue (ids) {
  if (!(ids instanceof Set)) ids = new Set(ids)
  return {
    type: CLEAR_FOLDER_COUNT_QUEUE,
    payload: ids
  }
}

export function countAssetsInFolderIds (ids, search) {
  if (search && search.empty()) {
    // Fast path -- empty search, just set filteredCounts to counts in reducer
    return ({
      type: FOLDER_COUNTS,
      payload: { search, ids }
    })
  }
  return dispatch => {
    console.log('Count query assets in folders ' + JSON.stringify(ids) + (search ? ' with query ' + JSON.stringify(search) : ' without search'))
    archivistPost(dispatch, `${rootEndpoint}/_assetCounts`, { search, ids })
      .then(response => {
        const counts = response.data.counts
        dispatch({
          type: FOLDER_COUNTS,
          payload: { search, ids, counts }
        })
      })
      .catch(error => {
        console.error('Error counting query assets in folders ' + JSON.stringify(ids) + ': ' + error)
      })
  }
}
