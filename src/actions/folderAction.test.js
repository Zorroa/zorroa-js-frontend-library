import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getFolderChildren } from './folderAction'
import Folder from '../models/Folder'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const baseURL = 'https://localhost:8066'
const archivist = axios.create({
  baseURL,
  withCredentials: true
})

// FIXME: Figure out how to test promise-based axios mock adapters!
describe('assetsActions', () => {
  const folder = new Folder({ id: 1, name: 'Parent' })
  const child = new Folder({ id: 2, name: 'Child' })

  xit('load folder children', () => {
    console.log('Wating for moxios')
    const store = mockStore({})

    const mockAdapter = new MockAdapter(archivist)
    mockAdapter.onGet(`${baseURL}/folders/${folder.id}/_children`)
      .reply(200, {
        status: 200,
        response: [child]
      })

    return store.dispatch(getFolderChildren(folder.id))
      .then(() => {
        expect(true).toBeTruthy()
      })
  })
})
