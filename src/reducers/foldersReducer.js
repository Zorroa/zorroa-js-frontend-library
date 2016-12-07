import {
  GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, UPDATE_FOLDER,
  DELETE_FOLDER, ADD_ASSETS_TO_FOLDER, REMOVE_ASSETS_FROM_FOLDER,
  CLEAR_FOLDERS_MODIFIED, TOGGLE_FOLDER, UNAUTH_USER, FOLDER_COUNTS
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
  selectedFolderIds: new Set()
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
        children.forEach(child => {
          let newChild = new Folder(child)
          const prevChild = all.get(child.id)
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

        return { ...state, all }
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
        return {...state, all, openFolderIds}
      }
      break
    }

    case UPDATE_FOLDER: {
      const folder = action.payload
      const oldFolder = state.all.get(folder.id)
      if (folder.id) {
        folder.childIds = oldFolder && oldFolder.childIds ? new Set(oldFolder.childIds) : new Set()
        let all = new Map(state.all) // copy folder map
        let openFolderIds = new Set(state.openFolderIds)
        all.set(folder.id, folder)
        const parent = state.all.get(folder.parentId) // get folder's parent to open it
        assert.ok(parent.childIds.has(folder.id))
        openFolderIds.add(parent.id) // make sure we can see the updated folder immediately
        return {...state, all, openFolderIds}
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
        return { ...state, all, openFolderIds, selectedFolderIds }
      }
      break

    case FOLDER_COUNTS: {
      const { search, ids, counts } = action.payload
      if (counts && counts.length && counts.length === ids.length) {
        let newCounts = new Map(state.counts)
        for (let i in ids) {
          newCounts.set(ids[i], counts[i])
        }
        if (search) return { ...state, filteredCounts: newCounts }
        return { ...state, counts: newCounts }
      }
      break
    }

    case ADD_ASSETS_TO_FOLDER:
      return { ...state, modified: true }

    case REMOVE_ASSETS_FROM_FOLDER:
      return { ...state, modified: true }

    case CLEAR_FOLDERS_MODIFIED:
      return { ...state, modified: false }

    case UNAUTH_USER:
      return initialState
  }

  return state
}
