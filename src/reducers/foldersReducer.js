import { GET_FOLDER_CHILDREN } from '../constants/actionTypes'
import Folder from '../models/Folder'
import * as assert from 'assert'

// Folders are stored in the all map indexed by id.
// Each entry in the map is a Folder object.
// A "children" field is added if the folder has children.

const browsing = new Folder({ id: -1, name: 'Browsing', dyhiRoot: true })
const collections = new Folder({ id: 0, name: 'Collections' })

export default function (state = { all: new Map([[0, browsing], [-1, collections]]) }, action) {
  switch (action.type) {
    case GET_FOLDER_CHILDREN:
      const folders = action.payload
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
        let kids = []
        folders.map(folder => {
          if (folder.isDyhi()) {
            dyhis.push(folder)
          } else {
            kids.push(folder)
          }
        })
        browsing.children = dyhis
        collections.children = kids
        updatedFolders.set(-1, browsing)
        updatedFolders.set(0, collections)
      }
      return { ...state, all: updatedFolders }
  }

  return state
}
