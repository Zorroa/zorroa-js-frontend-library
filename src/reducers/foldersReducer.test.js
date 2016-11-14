import foldersReducer, { createInitialState, initialState } from './foldersReducer'
import { GET_FOLDER_CHILDREN, CREATE_FOLDER, DELETE_FOLDER } from '../constants/actionTypes'
import Folder from '../models/Folder'

describe('foldersReducer', () => {
  it('GET_FOLDER_CHILDREN returns child list', () => {
    let beforeState = createInitialState()

    var child1 = new Folder({ id: 1, name: '1' })
    var child2 = new Folder({ id: 2, name: '2' })

    let afterState = createInitialState()
    afterState.all = new Map(initialState.all)
    afterState.all.set(child1.id, child1)
    afterState.all.set(child2.id, child2)
    afterState.all.get(0).childIds = new Set([child1.id, child2.id])

    expect(foldersReducer(beforeState,
      {
        type: GET_FOLDER_CHILDREN,
        payload: { parentId: Folder.ROOT_ID, children: [child1, child2] }
      }))
      .toEqual(afterState)
  })

  it('CREATE_FOLDER adds a new folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo', parentId: 0 })
    let afterState = createInitialState()
    afterState.all = new Map(initialState.all)
    afterState.all.set(foo.id, foo)
    afterState.all.get(0).childIds = new Set([1])
    expect(foldersReducer(initialState, { type: CREATE_FOLDER, payload: foo }))
      .toEqual(afterState)
  })

  it('DELETE_FOLDER removes a folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo', parentId: 0 })

    let beforeState = createInitialState()
    beforeState.all.set(foo.id, foo)
    beforeState.all.get(0).childIds = new Set([1])

    let afterState = createInitialState()
    afterState.all = new Map(initialState.all)

    expect(foldersReducer(beforeState, { type: DELETE_FOLDER, payload: foo.id }))
      .toEqual(afterState)
  })
})
