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
})
