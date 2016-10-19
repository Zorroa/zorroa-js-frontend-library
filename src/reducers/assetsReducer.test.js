import assetsReducer from './assetsReducer'
import { ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET } from '../constants/actionTypes'
import Page from '../models/Page'

describe('assetsReducer', () => {
  const query = 'foo'
  const assets = ['a']
  const page = new Page({size: 1, totalCount: 1})

  it('ASSET_SEARCH returns asset list', () => {
    const payload = { query, assets, page }
    const result = { query, all: assets, totalCount: 1, isolatedId: null }
    expect(assetsReducer([], { type: ASSET_SEARCH, payload }))
      .toEqual(result)
  })

  it('ASSET_SEARCH for second page concats assets', () => {
    // Reduce the first page of assets
    const payload1 = { query, assets, page }
    const state1 = assetsReducer({}, { type: ASSET_SEARCH, payload: payload1 })

    // Reduce the second page of assets
    const assets2 = ['b']
    const page2 = new Page({ from: 1, size: 1, totalCount: 2 })
    const payload2 = { query, assets: assets2, page: page2 }

    // Construct the expected result -- concateated arrays
    const concatAssets = assets.concat(assets2)
    const result = { query, all: concatAssets, totalCount: 2, isolatedId: null }
    expect(assetsReducer(state1, { type: ASSET_SEARCH, payload: payload2 }))
      .toEqual(result)
  })

  it('ASSET_SEARCH_ERROR returns error', () => {
    const a = 'a'
    expect(assetsReducer([], { type: ASSET_SEARCH_ERROR, payload: a }))
      .toEqual({ error: a })
  })

  it('ISOLATE_ASSET returns isolated asset id', () => {
    const id = '1234-abcd'
    expect(assetsReducer([], { type: ISOLATE_ASSET, payload: id }))
      .toEqual({ isolatedId: id })
  })
})
