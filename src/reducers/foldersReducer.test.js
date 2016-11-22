import foldersReducer, { createInitialState, initialState } from './foldersReducer'
import {
  GET_FOLDER_CHILDREN, CREATE_FOLDER, UPDATE_FOLDER, DELETE_FOLDER,
  TOGGLE_FOLDER, SELECT_FOLDERS
} from '../constants/actionTypes'
import Folder from '../models/Folder'

describe('foldersReducer', () => {
  it('TOGGLE_FOLDER adds to open folder', () => {
    const folderId = 3
    const isOpen = true
    let openFolderIds = new Set()
    openFolderIds['add'](folderId)
    expect(foldersReducer({}, { type: TOGGLE_FOLDER, payload: { folderId, isOpen } }))
      .toEqual({ openFolderIds })
  })

  it('TOGGLE_FOLDER deletes open folder', () => {
    const folderId = 3
    const isOpen = false
    let openFolderIds = new Set()
    openFolderIds['delete'](folderId)
    expect(foldersReducer({}, { type: TOGGLE_FOLDER, payload: { folderId, isOpen } }))
      .toEqual({ openFolderIds })
  })

  it('GET_FOLDER_CHILDREN returns child list', () => {
    let beforeState = createInitialState()

    var child1 = new Folder({ id: 1, name: '1' })
    var child2 = new Folder({ id: 2, name: '2' })

    let afterState = createInitialState()
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

  it('SELECT_FOLDERS adds to selected set', () => {
    const selectedFolderIds = new Set([1, 3, 5])
    expect(foldersReducer({}, { type: SELECT_FOLDERS, payload: selectedFolderIds }))
      .toEqual({ selectedFolderIds })
  })

  it('CREATE_FOLDER adds a new folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo', parentId: 0 })
    let afterState = createInitialState()
    afterState.all.set(foo.id, foo)
    afterState.all.get(0).childIds = new Set([1])
    expect(foldersReducer(initialState, { type: CREATE_FOLDER, payload: foo }))
      .toEqual(afterState)
  })

  it('UPDATE_FOLDER changes a folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo', parentId: 0 })
    const bar = new Folder({ id: 1, name: 'Bar', parentId: 0 })
    let afterState = createInitialState()
    afterState.all.set(foo.id, foo)
    afterState.all.get(0).childIds = new Set([1])
    const nextState = foldersReducer(initialState, { type: CREATE_FOLDER, payload: foo })
    let finalState = createInitialState()
    finalState.all.set(foo.id, bar)
    finalState.all.get(0).childIds = new Set([1])
    expect(foldersReducer(nextState, { type: UPDATE_FOLDER, payload: bar }))
      .toEqual(finalState)
  })

  it('DELETE_FOLDER removes a folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo', parentId: 0 })

    let beforeState = createInitialState()
    beforeState.all.set(foo.id, foo)
    beforeState.all.get(0).childIds = new Set([1])

    let afterState = createInitialState()

    expect(foldersReducer(beforeState, { type: DELETE_FOLDER, payload: foo.id }))
      .toEqual(afterState)
  })
})
