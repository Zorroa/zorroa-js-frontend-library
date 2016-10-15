import assetsReducer from './assetsReducer'
import { ASSET_SEARCH, ASSET_SEARCH_ERROR, ISOLATE_ASSET } from '../constants/actionTypes'

describe('assetsReducer', () => {
  it('ASSET_SEARCH returns asset list', () => {
    const a = 'a'
    expect(assetsReducer([], { type: ASSET_SEARCH, payload: [a] }))
      .toEqual({ all: [a], isolatedId: null })
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
