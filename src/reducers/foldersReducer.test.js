import foldersReducer, { initialState } from './foldersReducer'
import { GET_FOLDER_CHILDREN, CREATE_FOLDER, DELETE_FOLDER } from '../constants/actionTypes'
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
    const collections = new Folder({ id: -2, name: 'Collections' })
    const smart = new Folder({ id: -3, name: 'Smart Collections' })
    const simple = new Folder({ id: -4, name: 'Simple Collections' })
    collections.children = [ simple, smart ]
    const parent = new Folder({ id: 1, name: 'Parent', parentId: 0, dyhiRoot: false })
    const dyhi = new Folder({ id: 3, name: 'Dyhi', parentId: 0, dyhiRoot: true })
    smart.children = []
    simple.children = [parent]
    browsing.children = [dyhi]
    const expected = new Map([
      [browsing.id, browsing],
      [collections.id, collections],
      [smart.id, smart],
      [simple.id, simple],
      [parent.id, parent],
      [dyhi.id, dyhi]
    ])
    const payload = [parent, dyhi]
    expect(foldersReducer(undefined, { type: GET_FOLDER_CHILDREN, payload }))
      .toEqual({ all: expected })
  })

  it('CREATE_FOLDER adds a new folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo' })
    const simple = initialState[-4]
    let simple2 = new Folder(simple)
    simple2.children = [foo]
    let all = new Map(initialState.all)
    all.set(foo.id, foo)
    all.set(simple2.id, simple2)
    expect(foldersReducer(initialState, { type: CREATE_FOLDER, payload: foo }))
      .toEqual({ all })
  })

  it('DELETE_FOLDER removes a folder', () => {
    const foo = new Folder({ id: 1, name: 'Foo' })
    const bar = new Folder({ id: 2, name: 'Bar' })
    const simple = initialState[-4]
    let simple2 = new Folder(simple)
    simple2.children = [foo, bar]
    let all = new Map(initialState.all)
    all.set(foo.id, foo)
    all.set(bar.id, foo)
    all.set(simple2.id, simple2)

    let simple3 = new Folder(simple2)
    simple3.children = [bar]
    let all2 = new Map(all)
    all2.delete(foo.id)
    all2.set(simple3.id, simple3)
    expect(foldersReducer({ all }, { type: DELETE_FOLDER, payload: foo.id }))
      .toEqual({ all: all2 })
  })
})
