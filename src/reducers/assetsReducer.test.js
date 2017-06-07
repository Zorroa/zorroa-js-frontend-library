import assetsReducer from './assetsReducer'
import { ASSET_SEARCH, ASSET_SEARCH_ERROR, ASSET_FIELDS, ISOLATE_ASSET, SELECT_ASSETS } from '../constants/actionTypes'
import Page from '../models/Page'

// These are defined by webpack
// TODO: figure out how to have the webpack config define these for tests
window.DEBUG = false
window.PRODLOCAL = false
window.PROD = true

describe('assetsReducer', () => {
  const query = 'foo'
  const assets = [{id: 'a'}]
  const page = new Page({size: 1, totalCount: 1})

  it('ASSET_SEARCH returns asset list', () => {
    const payload = { query, assets, page }
    const result = {
      query,
      all: assets,
      totalCount: 1,
      suggestions: null,
      error: null,
      assetsCounter: 1
    }
    expect(assetsReducer({assetsCounter: 0}, { type: ASSET_SEARCH, payload }))
      .toEqual(result)
  })

  it('ASSET_SEARCH for second page concats assets DEBUG', () => {
    // Reduce the first page of assets
    const payload1 = { query, assets, page }
    const state1 = assetsReducer({assetsCounter: 0}, { type: ASSET_SEARCH, payload: payload1 })

    // Reduce the second page of assets
    const assets2 = [{id: 'b'}]
    const page2 = new Page({ from: 1, size: 1, totalCount: 2 })
    const payload2 = { query, assets: assets2, page: page2 }

    // Construct the expected result -- concateated arrays
    const concatAssets = assets.concat(assets2)
    const result = {
      query,
      all: concatAssets,
      totalCount: 2,
      suggestions: null,
      error: null,
      assetsCounter: 2
    }
    expect(assetsReducer(state1, { type: ASSET_SEARCH, payload: payload2 }))
      .toEqual(result)
  })

  it('ASSET_SEARCH_ERROR returns error', () => {
    const a = 'a'
    expect(assetsReducer([], { type: ASSET_SEARCH_ERROR, payload: a }))
      .toEqual({ error: a })
  })

  it('ASSET_FIELDS returns fields and types', () => {
    const fields = {'string': ['some.thing.important']}
    const types = {}
    Object.keys(fields).forEach(type => { fields[type].forEach(field => { types[field] = type }) })
    expect(assetsReducer([], { type: ASSET_FIELDS, payload: fields }))
      .toEqual({ fields, types })
  })

  it('ISOLATE_ASSET returns isolated asset id', () => {
    const id = '1234-abcd'
    expect(assetsReducer([], { type: ISOLATE_ASSET, payload: id }))
      .toEqual({ isolatedId: id })
  })

  it('SELECT_ASSETS returns a selected asset id', () => {
    const id0 = '1234-abcd'
    const id1 = '5678-zwxy'
    const ids = new Set([id0, id1])
    expect(assetsReducer({ selectionCounter: 0 }, {type: SELECT_ASSETS, payload: ids}))
      .toEqual({ selectedIds: ids, selectionCounter: 1 })
  })
})
