import { GET_FOLDER_CHILDREN } from '../constants/actionTypes'
import Folder from '../models/Folder'
import * as assert from 'assert'

// Folders are stored in the all map indexed by id.
// Each entry in the map is a Folder object.
// A "children" field is added if the folder has children.

export default function (state = { all: new Map([[0, new Folder({ id: 0, name: 'Browsing' })]]) }, action) {
  switch (action.type) {
    case GET_FOLDER_CHILDREN:
      const folders = action.payload
      let parent = state.all.get(folders[0].parentId)
      assert.ok(parent instanceof Folder)
      parent.children = folders     // Add children
      let updatedFolders = new Map(state.all)
      updatedFolders.set(parent.id, parent)
      folders.map(folder => {       // Add to top-level map
        updatedFolders.set(folder.id, folder)
      })
      return { ...state, all: updatedFolders }
  }

  return state
}
