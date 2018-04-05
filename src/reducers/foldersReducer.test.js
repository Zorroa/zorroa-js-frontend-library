import foldersReducer, {
  createInitialState,
  initialState,
} from './foldersReducer'
import {
  GET_FOLDER_CHILDREN,
  CREATE_FOLDER,
  UPDATE_FOLDER,
  DELETE_FOLDER,
  TOGGLE_FOLDER,
  SELECT_FOLDERS,
  TRASHED_FOLDERS,
  EMPTY_FOLDER_TRASH,
  RESTORE_TRASHED_FOLDERS,
  DELETE_TRASHED_FOLDERS,
} from '../constants/actionTypes'
import Folder from '../models/Folder'
import TrashedFolder from '../models/TrashedFolder'

const folderId0 = '00000000-0000-0000-0000-000000000000'
const folderId1 = 'a578c2a1-8d0e-1bfe-902c-12e2e01d3e01'
const folderId2 = 'a578c2a1-8d0e-1bfe-902c-12e2e01d3e02'
const folderId3 = 'a578c2a1-8d0e-1bfe-902c-12e2e01d3e00'

describe('foldersReducer', () => {
  it('TOGGLE_FOLDER adds to open folder', () => {
    const folderId = folderId1
    const isOpen = true
    let openFolderIds = new Set()
    openFolderIds['add'](folderId)
    expect(
      foldersReducer(
        {},
        { type: TOGGLE_FOLDER, payload: { folderId, isOpen } },
      ),
    ).toEqual({ openFolderIds })
  })

  it('TOGGLE_FOLDER deletes open folder', () => {
    const folderId = folderId1
    const isOpen = false
    let openFolderIds = new Set()
    openFolderIds['delete'](folderId)
    expect(
      foldersReducer(
        {},
        { type: TOGGLE_FOLDER, payload: { folderId, isOpen } },
      ),
    ).toEqual({ openFolderIds })
  })

  it('GET_FOLDER_CHILDREN returns child list', () => {
    let beforeState = createInitialState()

    var child1 = new Folder({ id: folderId1, name: '1' })
    var child2 = new Folder({ id: folderId2, name: '2' })

    let afterState = createInitialState()
    afterState.all.set(child1.id, child1)
    afterState.all.set(child2.id, child2)
    afterState.all.get(folderId0).childIds = new Set([child1.id, child2.id])

    expect(
      foldersReducer(beforeState, {
        type: GET_FOLDER_CHILDREN,
        payload: { parentId: Folder.ROOT_ID, children: [child1, child2] },
      }),
    ).toEqual(afterState)
  })

  it('SELECT_FOLDERS adds to selected set', () => {
    const selectedFolderIds = new Set([folderId1, folderId2, folderId3])
    expect(
      foldersReducer({}, { type: SELECT_FOLDERS, payload: selectedFolderIds }),
    ).toEqual({ selectedFolderIds })
  })

  it('CREATE_FOLDER adds a new folder', () => {
    const foo = new Folder({ id: folderId1, name: 'Foo', parentId: folderId0 })
    let afterState = createInitialState()
    afterState.all.set(foo.id, foo)
    afterState.all.get(folderId0).childIds = new Set([folderId1])
    afterState.all.get(folderId0).childCount = 1
    afterState.modifiedIds = new Set([folderId1])
    expect(
      foldersReducer(initialState, { type: CREATE_FOLDER, payload: foo }),
    ).toEqual(afterState)
  })

  it('UPDATE_FOLDER changes a folder', () => {
    const foo = new Folder({ id: folderId1, name: 'Foo', parentId: folderId0 })
    const bar = new Folder({ id: folderId1, name: 'Bar', parentId: folderId0 })
    let afterState = createInitialState()
    afterState.all.set(foo.id, foo)
    afterState.all.get(folderId0).childIds = new Set([folderId1])
    afterState.all.get(folderId0).childCount = 1
    const nextState = foldersReducer(initialState, {
      type: CREATE_FOLDER,
      payload: foo,
    })
    let finalState = createInitialState()
    finalState.all.set(foo.id, bar)
    finalState.all.get(folderId0).childIds = new Set([folderId1])
    finalState.all.get(folderId0).childCount = 1
    finalState.modifiedIds = new Set([folderId1])
    expect(
      foldersReducer(nextState, { type: UPDATE_FOLDER, payload: bar }),
    ).toEqual(finalState)
  })

  it('DELETE_FOLDER removes a folder', () => {
    const foo = new Folder({ id: folderId1, name: 'Foo', parentId: folderId0 })

    let beforeState = createInitialState()
    beforeState.all.set(foo.id, foo)
    beforeState.all.get(folderId0).childIds = new Set([folderId1])

    let afterState = createInitialState()

    expect(
      foldersReducer(beforeState, { type: DELETE_FOLDER, payload: foo.id }),
    ).toEqual(afterState)
  })
})

describe('folder trash reducer', () => {
  it('TRASHED_FOLDERS returns list of TrashedFolders', () => {
    const trashedFolders = [
      new TrashedFolder({ id: folderId1, folderId: folderId2, name: 'foo' }),
    ]
    expect(
      foldersReducer({}, { type: TRASHED_FOLDERS, payload: trashedFolders }),
    ).toEqual({ trashedFolders })
  })

  it('EMPTY_FOLDER_TRASH to clear out the trash', () => {
    const trashedFolders = [
      new TrashedFolder({ id: folderId1, folderId: folderId2, name: 'foo' }),
    ]
    expect(
      foldersReducer(
        { trashedFolders },
        { type: EMPTY_FOLDER_TRASH, payload: null },
      ),
    ).toEqual({ trashedFolders: null })
  })

  it('RESTORE_TRASHED_FOLDERS clears parent list and trashedFolders', () => {
    const parent = new Folder({ id: folderId2, name: 'parent' })
    const folder = new Folder({
      id: folderId3,
      name: 'foo',
      parentId: parent.id,
    })
    parent.childIds = new Set([folder.id])
    const all = new Map()
    all.set(parent.id, parent)
    all.set(folder.id, folder)
    const trashedFolder = new TrashedFolder({
      id: folderId1,
      folderId: folder.id,
      parentId: parent.id,
    })
    const trashedFolders = [trashedFolder]
    const afterParent = new Folder(parent)
    const afterAll = new Map()
    afterAll.set(afterParent.id, afterParent)
    afterAll.set(folder.id, folder)
    expect(
      foldersReducer(
        { all, trashedFolders },
        { type: RESTORE_TRASHED_FOLDERS, payload: [trashedFolder.id] },
      ),
    ).toEqual({ all: afterAll, trashedFolders: null })
  })

  it('DELETE_TRASHED_FOLDERS nulls out trashedFolders', () => {
    const trashedFolders = [
      new TrashedFolder({ id: folderId1, folderId: folderId2, name: 'foo' }),
    ]
    expect(
      foldersReducer(
        { trashedFolders },
        { type: DELETE_TRASHED_FOLDERS, payload: null },
      ),
    ).toEqual({ trashedFolders: null })
  })
})
