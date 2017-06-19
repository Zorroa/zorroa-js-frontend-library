import {
  GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, UPDATE_FOLDER,
  DELETE_FOLDER, TOGGLE_FOLDER, ADD_ASSETS_TO_FOLDER,
  REMOVE_ASSETS_FROM_FOLDER, FOLDER_COUNTS, QUEUE_FOLDER_COUNTS, CLEAR_FOLDER_COUNT_QUEUE
} from '../constants/actionTypes'
import Folder from '../models/Folder'
import AssetSearch from '../models/AssetSearch'
import { restoreSearch } from './racetrackAction'
import { archivistGet, archivistPut, archivistPost, archivistRequest } from './authAction'
import { selectId, equalSets } from '../services/jsUtil'

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

export function selectFolderIds (ids, curIds, folders) {
  if (!(ids instanceof Set)) ids = new Set(ids)
  let actions = []
  // If a new folder is added to the current selection,
  // restore the merged search from all selected folders
  if (curIds && folders && !equalSets(ids, curIds)) {
    const search = new AssetSearch()
    const iter = ids.keys()
    for (let i = iter.next(); !i.done; i = iter.next()) {
      const folder = folders.get(i.value)
      if (folder && folder.search) {
        search.merge(folder.search)
        console.log('Merging ' + folder.name + ': ' + JSON.stringify(search))
      }
    }
    if (JSON.stringify(search) !== JSON.stringify(new AssetSearch())) {
      const restoreActions = restoreSearch(search, true /* avoid infinite folder selection recursion */)
      restoreActions.forEach(action => actions.push(action))
    }
  }
  actions.push({
    type: SELECT_FOLDERS,
    payload: ids
  })
  return actions
}

// Works when folders is an array of either Folder or TrashedFolder so that
// we can share this logic without duplicating the TrashedFolder array into
// a Folder array each time we do selection, which would require dup+find.
// TrashedFolder.folderId is used instead of Folder.id rather than instanceof.
export function selectFolderId (id, shiftKey, metaKey, folders, selectedIds, all) {
  console.log('selectFolder')
  let selectedFolderIds = selectId(id, shiftKey, metaKey, folders, selectedIds)
  return selectFolderIds(selectedFolderIds, selectedIds, all)
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

function createDyHiProm (dispatch, folder, levels) {
  const folderId = folder.id
  console.log('Create dyhi inside folder id ' + folderId, ' with ' + JSON.stringify(levels))
  return archivistPost(dispatch, '/api/v1/dyhi', { folderId, levels })
    .then(response => {
      folder.dyhiId = response.data.id
      folder.childCount = 1  // Force loadChildren
      dispatch({
        type: CREATE_FOLDER,
        payload: folder
      })
    })
    .catch(error => {
      console.error('Error creating dyhi for ' + folder.id + ' with ' + JSON.stringify(levels) + ': ' + error)
    })
}

export function createDyHiFolder (folder, dyhiLevels) {
  return dispatch => {
    console.log('Create dyhi for ' + folder.name + ' with ' + JSON.stringify(dyhiLevels))
    archivistPost(dispatch, `${rootEndpoint}`, folder)
      .then(response => {
        const dyhi = new Folder(response.data)
        console.log('Created DyHi folder: ' + JSON.stringify(dyhi))
        createDyHiProm(dispatch, dyhi, dyhiLevels)
      })
      .catch(error => {
        console.error('Error creating folder ' + folder.name + ': ' + error)
      })
  }
}
