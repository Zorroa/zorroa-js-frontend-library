import { GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, DELETE_FOLDER, TOGGLE_FOLDER } from '../constants/actionTypes'
import Folder from '../models/Folder'
import * as assert from 'assert'

// Folders are stored in the all map indexed by id.
// Each entry in the map is a Folder object.
// A "childIds" field is added if the folder has children.

const root = new Folder({ id: Folder.ROOT_ID, name: 'Root' })

export var createInitialState = () => ({
  // Folder model data from the server
  all: new Map([[ root.id, root ]]),

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
          const prevChild = all.get(child.id)
          if (prevChild && prevChild.childIds && !child.childIds) {
            child.childIds = new Set(prevChild.childIds)
          }
          all.set(child.id, child)
        })

        // Update parent's childIds list
        if (parentId >= Folder.ROOT_ID) {
          let parent = all.get(parentId)
          assert.ok(parent instanceof Folder)
          // Add children
          parent.childIds = new Set(children.map(child => child.id))
          all.set(parent.id, parent)
        }

        return { ...state, all }
      }
      break

    case SELECT_FOLDERS:
      return { ...state, selectedFolderIds: action.payload }

    case CREATE_FOLDER:
      const folder = action.payload
      if (folder.id) {
        let all = new Map(state.all)
        all.set(folder.id, folder)
        const parent = state.all.get(folder.parentId)
        console.log('CREATE_FOLDER', 'folder.id', folder.id, 'folder.parentId', folder.parentId)
        if (!parent.childIds) parent.childIds = new Set()
        parent.childIds.add(folder.id)
        all.set(parent.id, parent)
        return { ...state, all }
      }
      break

    case DELETE_FOLDER:
      const id = action.payload
      if (id) {
        let all = new Map(state.all)
        let openFolderIds = new Set(state.openFolderIds)
        let selectedFolderIds = new Set(state.selectedFolderIds)
        const folder = state.all.get(id)
        if (folder) {
          const parent = state.all.get(folder.parentId)
          if (parent.childIds) parent.childIds.delete(folder.id)
          all.delete(id)
          openFolderIds.delete(id)
          selectedFolderIds.delete(id)
        }
        return { ...state, all, openFolderIds, selectedFolderIds }
      }
      break
  }

  return state
}
