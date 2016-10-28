import sliversReducer from './sliversReducer'
import { MODIFY_SLIVERS, REMOVE_SLIVERS, RESET_SLIVERS } from '../constants/actionTypes'
import AssetSearch from '../models/AssetSearch'

describe('sliversReducer', () => {
  it('MODIFY_SLIVERS returns modified slivers', () => {
    const sliver = new AssetSearch({ query: 'foo' })
    const payload = { 1: sliver }
    const result = payload
    expect(sliversReducer({}, { type: MODIFY_SLIVERS, payload }))
      .toEqual(result)
  })

  it('REMOVE_SLIVERS returns empty slivers', () => {
    const sliver = new AssetSearch({ query: 'foo' })
    const initialState = { 1: sliver }
    expect(sliversReducer(initialState, { type: REMOVE_SLIVERS, payload: [1] }))
      .toEqual({})
  })

  it('REMOVE_SLIVERS returns smaller slivers', () => {
    const sliver1 = new AssetSearch({ query: 'foo' })
    const sliver2 = new AssetSearch({ query: 'bar' })
    const initialState = { 1: sliver1, 2: sliver2 }
    const result = { 2: sliver2 }
    expect(sliversReducer(initialState, { type: REMOVE_SLIVERS, payload: [1] }))
      .toEqual(result)
  })

  it('RESET_SLIVERS to replace initial state', () => {
    const sliver1 = new AssetSearch({ query: 'foo' })
    const sliver2 = new AssetSearch({ query: 'bar' })
    const sliver3 = new AssetSearch({ query: 'bam' })
    const initialState = { 1: sliver1, 2: sliver2 }
    const payload = { 1: sliver3 }
    const result = payload
    expect(sliversReducer(initialState, { type: RESET_SLIVERS, payload }))
      .toEqual(result)
  })

  it('RESET_SLIVERS with undefined returns object', () => {
    const sliver1 = new AssetSearch({ query: 'foo' })
    const sliver2 = new AssetSearch({ query: 'bar' })
    const initialState = { 1: sliver1, 2: sliver2 }
    const result = {}
    expect(sliversReducer(initialState, { type: RESET_SLIVERS, undefined }))
      .toEqual(result)
  })
})
