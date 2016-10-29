import foldersReducer from './foldersReducer'
import { GET_FOLDER_CHILDREN } from '../constants/actionTypes'
import Folder from '../models/Folder'

describe('foldersReducer', () => {
  it('GET_FOLDER_CHILDREN returns child list', () => {
    const root = new Folder({ id: 1, name: 'Parent' })
    var orig = new Map([[ root.id, root ]])
    var child = new Folder({ id: 2, name: 'Child' })
    child.parentId = root.id
    var parent = new Folder(root)
    parent.children = [child]
    var expected = new Map([[parent.id, parent], [child.id, child]])
    expect(foldersReducer({ all: orig }, { type: GET_FOLDER_CHILDREN, payload: [child] }))
      .toEqual({ all: expected })
  })

  it('GET_FOLDER_CHILDREN creates both collections and browsing', () => {
    const browsing = new Folder({ id: -1, name: 'Browsing', dyhiRoot: true })
    const collections = new Folder({ id: 0, name: 'Collections' })
    const parent = new Folder({ id: 1, name: 'Parent', parentId: 0, dyhiRoot: false })
    const dyhi = new Folder({ id: 3, name: 'Dyhi', parentId: 0, dyhiRoot: true })
    collections.children = [parent]
    browsing.children = [dyhi]
    let expected = new Map([[collections.id, collections], [browsing.id, browsing], [parent.id, parent], [dyhi.id, dyhi]])
    let payload = [parent, dyhi]
    expect(foldersReducer(undefined, { type: GET_FOLDER_CHILDREN, payload }))
      .toEqual({ all: expected })
  })
})
