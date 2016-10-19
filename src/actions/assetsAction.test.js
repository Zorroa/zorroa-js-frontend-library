import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { searchAssets, isolateAsset } from './assetsAction'
import Asset from '../models/Asset'
import { ISOLATE_ASSET } from '../constants/actionTypes'
import Page from '../models/Page'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const baseURL = 'https://localhost:8066'
const archivist = axios.create({
  baseURL,
  withCredentials: true
})

describe('assetsActions', () => {
  const asset = new Asset({ id: '12345' })

  xit('search for assets', () => {
    console.log('Wating for moxios')
    const store = mockStore({})

    const mockAdapter = new MockAdapter(archivist)
    mockAdapter.onPost('/api/v3/assets/_search')
      .reply(200, {
        status: 200,
        response: { query: '', assets: [asset], page: new Page({from: 0, size: 1, totalCount: 1}) }
      })

    return store.dispatch(searchAssets({query: 'foo'}))
      .then(() => {
        expect(true).toBeTruthy()
      })
  })

  it('should isolate asset', () => {
    const id = '12345-abcde'
    const expectedAction = {
      type: ISOLATE_ASSET,
      payload: id
    }
    expect(isolateAsset(id)).toEqual(expectedAction)
  })
})
