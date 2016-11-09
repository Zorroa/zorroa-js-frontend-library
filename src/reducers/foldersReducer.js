import { GET_FOLDER_CHILDREN, SELECT_FOLDERS, CREATE_FOLDER, DELETE_FOLDER } from '../constants/actionTypes'
import Folder from '../models/Folder'
import * as assert from 'assert'

// Folders are stored in the all map indexed by id.
// Each entry in the map is a Folder object.
// A "children" field is added if the folder has children.

const browsing = new Folder({ id: -1, name: 'Browsing', dyhiRoot: true })
const collections = new Folder({ id: -2, name: 'Collections' })
const smart = new Folder({ id: -3, name: 'Smart Collections' })
const simple = new Folder({ id: -4, name: 'Simple Collections' })
export const initialState = {
  all: new Map([
    [browsing.id, browsing],
    [collections.id, collections],
    [smart.id, smart],
    [simple.id, simple]
  ])
}

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_FOLDER_CHILDREN:
      const folders = action.payload
      if (folders && folders.length) {
        let updatedFolders = new Map(state.all)
        folders.map(folder => {       // Add to top-level map
          updatedFolders.set(folder.id, folder)
        })
        const parentId = folders[0].parentId
        if (parentId) {
          let parent = state.all.get(folders[0].parentId)
          assert.ok(parent instanceof Folder)
          parent.children = folders     // Add children
          updatedFolders.set(parent.id, parent)
        } else {
          // Special case the root folders, splitting out dyhi
          let dyhis = []
          let smartKids = []
          let simpleKids = []
          folders.map(folder => {
            if (folder.isDyhi()) {
              dyhis.push(folder)
            } else if (folder.search) {
              smartKids.push(folder)
            } else {
              simpleKids.push(folder)
            }
          })
          browsing.children = dyhis
          smart.children = smartKids
          simple.children = simpleKids
          collections.children = [ simple, smart ]
          updatedFolders.set(browsing.id, browsing)
          updatedFolders.set(collections.id, collections)
          updatedFolders.set(smart.id, smart)
          updatedFolders.set(simple.id, simple)
        }
        return {...state, all: updatedFolders}
      }
      break
    case SELECT_FOLDERS:
      return { ...state, selectedIds: action.payload }
    case CREATE_FOLDER:
      const folder = action.payload
      if (folder.id) {
        let all = new Map(state.all)
        all.set(folder.id, folder)
        const parent = state.all.get(folder.parentId)
        let mom = new Folder(parent)
        if (mom.children) {
          mom.children = [ ...mom.children, folder ]
        } else {
          mom.children = [folder]
        }
        all.set(mom.id, mom)
        return { ...state, all }
      }
      break
    case DELETE_FOLDER:
      const id = action.payload
      if (id) {
        let all = new Map(state.all)
        const folder = state.all.get(id)
        if (folder) {
          const parent = state.all.get(folder.parentId)
          let mom = new Folder(parent)
          if (parent.children) {
            const index = parent.children.findIndex(folder => (folder.id === id))
            if (index >= 0) {
              mom.children = [ ...parent.children ]
              mom.children.splice(index, 1)
              all.set(mom.id, mom)
            }
          }
        }
        all.delete(id)
        return { ...state, all }
      }
      break
  }

  return state
}
