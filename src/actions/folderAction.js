import {
  GET_FOLDER_CHILDREN,
  SELECT_FOLDERS,
  CREATE_FOLDER,
  CREATE_FOLDER_SUCCESS,
  CREATE_FOLDER_ERROR,
  UPDATE_FOLDER,
  DELETE_FOLDER,
  TOGGLE_FOLDER,
  ADD_ASSETS_TO_FOLDER,
  REMOVE_ASSETS_FROM_FOLDER,
  DROP_FOLDER_ID,
  FOLDER_COUNTS,
  CLEAR_MODIFIED_FOLDERS,
  CREATE_TAXONOMY,
  DELETE_TAXONOMY,
  UPDATE_FOLDER_PERMISSIONS,
  GET_FOLDER_BY_ID,
} from '../constants/actionTypes'
import Folder from '../models/Folder'
import {
  archivistGet,
  archivistPut,
  archivistPost,
  archivistRequest,
  archivistDelete,
} from './authAction'
import { restoreFolders } from './racetrackAction'
import { selectId } from '../services/jsUtil'
import api from '../api'

const rootEndpoint = '/api/v1/folders'

export function toggleFolder(folderId, isOpen) {
  return dispatch => {
    console.log('Toggle Folder', folderId, isOpen)
    dispatch({
      type: TOGGLE_FOLDER,
      payload: { folderId, isOpen },
    })
  }
}

export function getFolderById(folderId) {
  return dispatch => {
    dispatch({
      type: GET_FOLDER_BY_ID,
      payload: { folderId },
    })

    api.folders.getById(folderId).then(
      response => {
        dispatch({
          type: GET_FOLDER_CHILDREN,
          payload: {
            parentId: response.parentId,
            children: [response],
          },
        })
      },
      error => {
        console.error(
          `Unable to get folder by ID for folder ${folderId}`,
          error,
        )
      },
    )
  }
}

// Queue a load of the children for folder <parentId>
// pass optOnDoneFn optionally to receive a callback when the request is returned
// the request will be passed the list of children loaded
export function getFolderChildren(parentId, optOnDoneFn) {
  if (parentId < Folder.ROOT_ID) {
    // Catch "fake" folders, if used
    return () => {
      return Promise.resolve()
    }
  }
  return dispatch => {
    console.log('Load folder ' + parentId)
    return archivistGet(dispatch, `${rootEndpoint}/${parentId}/_children`).then(
      response => {
        const children = response.data.map(folder => new Folder(folder))
        if (optOnDoneFn) optOnDoneFn(children)
        return dispatch({
          type: GET_FOLDER_CHILDREN,
          payload: { parentId, children },
        })
      },
    )
  }
}

export function selectFolderIds(ids) {
  if (!(ids instanceof Set)) ids = new Set(ids)
  return [
    {
      type: SELECT_FOLDERS,
      payload: ids,
    },
  ]
}

// Select the folder and restore launchpads if needed.
// Works when folders is an array of either Folder or TrashedFolder so that
// we can share this logic without duplicating the TrashedFolder array into
// a Folder array each time we do selection, which would require dup+find.
// TrashedFolder.folderId is used instead of Folder.id rather than instanceof.
export function selectFolderId(id, shiftKey, metaKey, folders, selectedIds) {
  let selectedFolderIds = selectId(id, shiftKey, metaKey, folders, selectedIds)
  const restoredFolders = []
  selectedFolderIds = new Set(
    [...selectedFolderIds].filter(id => {
      const folder = folders.find(folder => id === folder.id)
      if (!folder) return false
      if (folder.isLaunchpad()) {
        restoredFolders.push(folder)
        return false
      }
      return true
    }),
  )

  let actions = []
  if (selectedFolderIds.size)
    actions = actions.concat(selectFolderIds(selectedFolderIds))
  const upsert = shiftKey || metaKey
  if (restoredFolders.length)
    actions = actions.concat(restoreFolders(restoredFolders, upsert))

  return actions
}

export function createFolder(folder, assetIds) {
  return dispatch => {
    dispatch({
      type: CREATE_FOLDER,
      payload: {
        folder,
        assetIds,
      },
    })
    archivistPost(dispatch, `${rootEndpoint}`, folder)
      .then(response => {
        const folder = new Folder(response.data)
        dispatch({
          type: CREATE_FOLDER_SUCCESS,
          payload: folder,
        })
        if (assetIds) {
          // Chain actions to add assets to newly created folder
          addAssetIdsToFolderIdProm(dispatch, assetIds, folder.id)
        }
      })
      .catch(errorResponse => {
        let error = {
          error: 'Unable to create smart collection',
        }

        if (typeof errorResponse.response === 'object') {
          error = errorResponse.response.data
        }
        dispatch({
          type: CREATE_FOLDER_ERROR,
          payload: {
            error,
          },
        })
      })
  }
}

export function updateFolder(folder) {
  return dispatch => {
    console.log('Update folder: ' + JSON.stringify(folder))
    archivistPut(dispatch, `${rootEndpoint}/${folder.id}`, folder)
      .then(response => {
        dispatch({
          type: UPDATE_FOLDER,
          payload: new Folder(response.data),
        })
      })
      .catch(error => {
        console.error('Error updating folder ' + folder.name + ': ' + error)
      })
  }
}

export function updateFolderPermissions(folderId, acl) {
  return dispatch => {
    console.log(
      'Update folder ' + folderId + ' permissions: ' + JSON.stringify(acl),
    )
    archivistPut(dispatch, `${rootEndpoint}/${folderId}/_permissions`, { acl })
      .then(response => {
        dispatch({
          type: UPDATE_FOLDER_PERMISSIONS,
          payload: new Folder(response.data),
        })
      })
      .catch(error => {
        console.error(
          'Error updating folder ' + folderId + ' permissions: ' + error,
        )
      })
  }
}

export function deleteFolderIds(ids) {
  return dispatch => {
    for (let id of ids) {
      console.log('Delete folder ' + id)
      // Workaround CORS issue in OPTIONS preflight request for axios.delete
      const request = {
        method: 'delete',
        url: `${rootEndpoint}/${id}`,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }
      archivistRequest(dispatch, request)
        .then(response => {
          dispatch({
            type: DELETE_FOLDER,
            payload: id,
          })
        })
        .catch(error => {
          console.error('Error deleting folder ' + id + ': ' + error)
        })
    }
  }
}

export function addAssetIdsToFolderId(assetIds, folderId) {
  return dispatch => addAssetIdsToFolderIdProm(dispatch, assetIds, folderId)
}

export function addAssetIdsToFolderIdProm(dispatch, assetIds, folderId) {
  if (assetIds instanceof Set) assetIds = [...assetIds]
  console.log(
    'Add assets ' + JSON.stringify(assetIds) + ' to folder ' + folderId,
  )
  return archivistPost(dispatch, `${rootEndpoint}/${folderId}/assets`, assetIds)
    .then(response => {
      dispatch({
        type: ADD_ASSETS_TO_FOLDER,
        payload: { assetIds, folderId, data: response.data },
      })
    })
    .catch(error => {
      console.error(
        'Error adding assets ' +
          JSON.stringify(assetIds) +
          ' to folder ' +
          folderId +
          ': ' +
          error,
      )
    })
}

export function removeAssetIdsFromFolderId(assetIds, folderId) {
  return dispatch => {
    if (assetIds instanceof Set) assetIds = [...assetIds]
    console.log(
      'Remove assets ' + JSON.stringify(assetIds) + ' from folder ' + folderId,
    )
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'delete',
      url: `${rootEndpoint}/${folderId}/assets`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      data: assetIds,
    }
    archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: REMOVE_ASSETS_FROM_FOLDER,
          payload: { assetIds, folderId, data: response.data },
        })
      })
      .catch(error => {
        console.error(
          'Error removing assets ' +
            JSON.stringify(assetIds) +
            ' from folder ' +
            folderId +
            ': ' +
            error,
        )
      })
  }
}

export function countAssetsInFolderIds(ids, search) {
  if ((search && search.empty()) || (!ids || !ids.length)) {
    // Fast path -- empty search, just set filteredCounts to counts in reducer
    return [
      { type: FOLDER_COUNTS, payload: { search, ids } },
      { type: CLEAR_MODIFIED_FOLDERS, payload: ids },
    ]
  }
  return dispatch => {
    console.log(
      'Count query assets in folders ' +
        JSON.stringify(ids) +
        (search ? ' with query ' + JSON.stringify(search) : ' without search'),
    )
    dispatch({ type: CLEAR_MODIFIED_FOLDERS, payload: ids })
    return archivistPost(dispatch, `${rootEndpoint}/_assetCounts`, {
      search,
      ids,
    })
      .then(response => {
        const counts = response.data.counts
        dispatch({
          type: FOLDER_COUNTS,
          payload: { search, ids, counts },
        })
      })
      .catch(error => {
        console.error(
          'Error counting query assets in folders ' +
            JSON.stringify(ids) +
            ': ' +
            error,
        )
        return Promise.reject(error)
      })
  }
}

function createDyHiProm(dispatch, folder, levels) {
  const folderId = folder.id
  return archivistPost(dispatch, '/api/v1/dyhi', { folderId, levels })
    .then(response => {
      folder.dyhiId = response.data.id
      folder.childCount = 1 // Force loadChildren
      dispatch({
        type: CREATE_FOLDER_SUCCESS,
        payload: folder,
      })
    })
    .catch(error => {
      dispatch({
        type: CREATE_FOLDER_ERROR,
        payload: {
          error: error.response.data,
        },
      })
    })
}

export function createDyHiFolder(folder, dyhiLevels) {
  return dispatch => {
    console.log(
      'Create dyhi for ' + folder.name + ' with ' + JSON.stringify(dyhiLevels),
    )
    dispatch({
      type: CREATE_FOLDER,
      payload: {
        folder,
      },
    })
    archivistPost(dispatch, `${rootEndpoint}`, folder)
      .then(response => {
        const dyhi = new Folder(response.data)
        console.log('Created DyHi folder: ' + JSON.stringify(dyhi))
        return createDyHiProm(dispatch, dyhi, dyhiLevels)
      })
      .catch(error => {
        dispatch({
          type: CREATE_FOLDER_ERROR,
          payload: {
            error: error.response.data,
          },
        })
        console.error('Error creating folder ' + folder.name + ': ' + error)
      })
  }
}

export function dropFolderId(id) {
  return {
    type: DROP_FOLDER_ID,
    payload: id,
  }
}

export function createTaxonomy(folderId) {
  return dispatch => {
    console.log('Create taxonomy for folder id ' + folderId)
    archivistPost(dispatch, '/api/v1/taxonomy', { folderId })
      .then(response => {
        dispatch({
          type: CREATE_TAXONOMY,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error(
          'Error creating taxonomy for folder id ' + folderId + ': ' + error,
        )
      })
  }
}

export function deleteTaxonomy(folderId) {
  return dispatch => {
    console.log('Delete taxonomy for folder id ' + folderId)
    archivistGet(dispatch, `/api/v1/taxonomy/_folder/${folderId}`)
      .then(response => {
        const taxonomy = response.data
        archivistDelete(dispatch, `/api/v1/taxonomy/${taxonomy.taxonomyId}`)
          .then(response => {
            dispatch({
              type: DELETE_TAXONOMY,
              payload: taxonomy,
            })
          })
          .catch(error => {
            console.error(
              'Error deleting taxonomy for folder ' + folderId + ': ' + error,
            )
          })
      })
      .catch(error => {
        console.error(
          'Error getting taxonomy for folder id ' + folderId + ': ' + error,
        )
      })
  }
}
