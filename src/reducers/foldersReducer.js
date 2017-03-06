import {
  GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, UPDATE_FOLDER,
  DELETE_FOLDER, ADD_ASSETS_TO_FOLDER, REMOVE_ASSETS_FROM_FOLDER,
  TOGGLE_FOLDER, UNAUTH_USER, FOLDER_COUNTS,
  TRASHED_FOLDERS, EMPTY_FOLDER_TRASH, COUNT_TRASHED_FOLDERS,
  RESTORE_TRASHED_FOLDERS, DELETE_TRASHED_FOLDERS
} from '../constants/actionTypes'
import Folder from '../models/Folder'
import * as assert from 'assert'

// Folders are stored in the all map indexed by id.
// Each entry in the map is a Folder object.
// A "childIds" field is added if the folder has children.

export var createInitialState = () => ({
  // Folder model data from the server
  all: new Map([[ Folder.ROOT_ID, new Folder({ id: Folder.ROOT_ID, name: 'Root' }) ]]),

  // Counts of folders for current search
  counts: new Map([[ Folder.ROOT_ID, 0 ]]),

  // a set of folder ids. items in the set are "open", meaning visible & un-collapsed in the UI
  openFolderIds: new Set([Folder.ROOT_ID]),

  // a set of folder ids, indicating which folders are user-selected
  selectedFolderIds: new Set(),

  // TrashedFolder array, or null if we need to re-fetch
  trashedFolders: null,

  // Modified folder ids and ancestors since last clearModifiedFolders
  modifiedIds: new Set()
})
export const initialState = createInitialState()

export default function (state = initialState, action) {
  switch (action.type) {
    case TOGGLE_FOLDER:
      const { folderId, isOpen } = action.payload
      assert.ok(folderId >= Folder.ROOT_ID)
      let openFolderIds = new Set(state.openFolderIds)
      openFolderIds[ isOpen ? 'add' : 'delete' ](folderId)
      return { ...state, openFolderIds }

    case GET_FOLDER_CHILDREN:
      const { parentId, children } = action.payload
      if (children) {
        let all = new Map(state.all) // copy previous state

        // Add children to app state, preserve existing grandchildren
        const modifiedIds = new Set(state.modifiedIds)
        children.forEach(child => {
          let newChild = new Folder(child)
          const prevChild = all.get(child.id)
          _addAncestorIds(prevChild, modifiedIds, state.all)
          _addAncestorIds(newChild, modifiedIds, state.all)
          if (prevChild && prevChild.childIds && !child.childIds) {
            newChild.childIds = new Set(prevChild.childIds)
          } else if (child.childIds) {
            newChild.childIds = new Set(child.childIds)
          }
          all.set(newChild.id, newChild)
        })

        // Update parent's childIds list
        if (parentId >= Folder.ROOT_ID) {
          const parent = all.get(parentId)
          assert.ok(parent instanceof Folder)
          let newParent = new Folder(parent)
          // Add children
          newParent.childIds = new Set(children.map(child => child.id))
          all.set(newParent.id, newParent)
        }

        return { ...state, all, modifiedIds }
      }
      break

    case SELECT_FOLDERS:
      return { ...state, selectedFolderIds: action.payload }

    case CREATE_FOLDER: {
      const folder = action.payload
      if (folder.id) {
        folder.childIds = new Set() // new folder has no children
        let all = new Map(state.all) // copy folder map
        let openFolderIds = new Set(state.openFolderIds)
        all.set(folder.id, folder)
        const parent = state.all.get(folder.parentId) // copy folder's parent
        let newParent = new Folder(parent)
        if (!parent.childIds) {
          newParent.childIds = new Set()
        } else {
          newParent.childIds = new Set(parent.childIds) // copy; about to modify
        }
        newParent.childIds.add(folder.id)
        all.set(newParent.id, newParent)
        openFolderIds.add(newParent.id) // make sure we can see the new folder immediately
        const modifiedIds = new Set(state.modifiedIds)
        _addAncestorIds(folder, modifiedIds, state.all)
        return {...state, all, openFolderIds, modifiedIds}
      }
      break
    }

    case UPDATE_FOLDER: {
      const folder = action.payload
      const oldFolder = state.all.get(folder.id)
      const parent = state.all.get(folder.parentId) // get folder's parent to open it
      if (folder.id) {
        let all = new Map(state.all) // copy folder map
        if (oldFolder && oldFolder.childIds) {
          if (oldFolder.parentId !== folder.parentId) {
            // Remove from old parent child list
            const oldParent = state.all.get(oldFolder.parentId)
            const newOldParent = new Folder(oldParent)
            const newOldParentChildIds = new Set(oldParent.childIds)
            newOldParentChildIds.delete(folder.id)
            newOldParent.childIds = newOldParentChildIds
            all.set(oldParent.id, newOldParent)
            // Add to new parent child list
            const newParent = new Folder(parent)
            const newParentChildIds = parent.childIds ? new Set(parent.childIds) : new Set()
            newParentChildIds.add(folder.id)
            newParent.childIds = newParentChildIds
            all.set(parent.id, newParent)
          } else {
            assert.ok(parent.childIds.has(folder.id))
          }
          folder.childIds = new Set(oldFolder.childIds)
        } else {
          folder.childIds = new Set()
          assert.ok(parent.childIds.has(folder.id))
        }
        let openFolderIds = new Set(state.openFolderIds)
        all.set(folder.id, folder)
        openFolderIds.add(parent.id) // make sure we can see the updated folder immediately
        const modifiedIds = new Set(state.modifiedIds)
        _addAncestorIds(oldFolder, modifiedIds, state.all)
        _addAncestorIds(folder, modifiedIds, state.all)
        return {...state, all, openFolderIds, modifiedIds}
      }
      break
    }

    case DELETE_FOLDER:
      const id = action.payload
      if (id) {
        let all = new Map(state.all)
        let openFolderIds = new Set(state.openFolderIds)
        let selectedFolderIds = new Set(state.selectedFolderIds)
        const folder = state.all.get(id)
        if (folder) {
          const parent = state.all.get(folder.parentId)
          let newParent = new Folder(parent)
          if (parent.childIds) {
            var childIds = new Set(parent.childIds)
            childIds.delete(folder.id)
            if (childIds.size > 0) newParent.childIds = childIds
          }
          all.set(newParent.id, newParent)
          all.delete(id)
          openFolderIds.delete(id)
          selectedFolderIds.delete(id)
        }
        return { ...state, all, openFolderIds, selectedFolderIds, trashedFolders: null }
      }
      break

    case FOLDER_COUNTS: {
      const { search, ids, counts } = action.payload
      if (counts && counts.length && counts.length === ids.length) {
        const newCounts = new Map(search ? state.filteredCounts : state.counts)
        const modifiedIds = new Set([...state.modifiedIds])
        for (let i = 0; i < ids.length; ++i) {
          newCounts.set(ids[i], counts[i])
          if (!search) modifiedIds.delete(ids[i])
        }
        if (search) {
          return { ...state, filteredCounts: newCounts }
        }
        return { ...state, counts: newCounts, modifiedIds }
      } else if (search && search.empty() && ids && ids.length) {
        // Fast path: copy the counts into the filter counts
        const newCounts = new Map(state.filteredCounts)
        for (let i = 0; i < ids.length; ++i) {
          newCounts.set(ids[i], state.counts[ids[i]])
        }
        return { ...state, filteredCounts: newCounts }
      }
      break
    }

    case ADD_ASSETS_TO_FOLDER: {
      const folder = state.all && state.all.get(action.payload.folderId)
      const modifiedIds = new Set(state.modifiedIds)
      _addAncestorIds(folder, modifiedIds, state.all)
      return { ...state, modifiedIds }
    }

    case REMOVE_ASSETS_FROM_FOLDER: {
      const folder = state.all && state.all.get(action.payload.folderId)
      const modifiedIds = new Set(state.modifiedIds)
      _addAncestorIds(folder, modifiedIds, state.all)
      return { ...state, modifiedIds }
    }

    case TRASHED_FOLDERS:
      return { ...state, trashedFolders: action.payload }

    case EMPTY_FOLDER_TRASH:
      return { ...state, trashedFolders: null }

    case RESTORE_TRASHED_FOLDERS: {
      let all = new Map(state.all) // copy folder map
      const trashedFolderIds = action.payload
      trashedFolderIds.forEach(trashedFolderId => {
        const trashedFolder = state.trashedFolders.find(trashedFolder => (trashedFolder.id === trashedFolderId))
        if (trashedFolder) {
          const parent = state.all.get(trashedFolder.parentId)
          const newParent = new Folder(parent)  // new folder with undefined children to force re-load
          all.set(newParent.id, newParent)
        }
      })
      return { ...state, all, trashedFolders: null }
    }

    case DELETE_TRASHED_FOLDERS:
      return { ...state, trashedFolders: null }

    case COUNT_TRASHED_FOLDERS:
      return { ...state }

    case UNAUTH_USER:
      return initialState
  }

  return state
}

function _addAncestorIds (folder, set, folders) {
  if (!folder || folder.id === Folder.ROOT_ID) return
  set.add(folder.id)
  const parent = folders.get(folder.parentId)
  _addAncestorIds(parent, set, folders)
}
