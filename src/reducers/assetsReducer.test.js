import assetsReducer from './assetsReducer'
import { ASSET_SEARCH, ASSET_SEARCH_ERROR } from '../constants/actionTypes'

describe('assetsReducer', () => {
  it('ASSET_SEARCH returns asset list', () => {
    const a = 'a'
    expect(assetsReducer([], { type: ASSET_SEARCH, payload: [a] }))
      .toEqual({ all: [a] })
  })

  it('ASSET_SEARCH_ERROR returns error', () => {
    const a = 'a'
    expect(assetsReducer([], { type: ASSET_SEARCH_ERROR, payload: a }))
      .toEqual({ error: a })
  })
})
