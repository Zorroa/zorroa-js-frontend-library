import { modifySlivers, removeSlivers, resetSlivers } from './sliversAction'
import { MODIFY_SLIVERS, REMOVE_SLIVERS, RESET_SLIVERS } from '../constants/actionTypes'
import AssetSearch from '../models/AssetSearch'

describe('sliversActions', () => {
  it('should modify sliver', () => {
    const sliver = new AssetSearch({query: 'foo'})
    const slivers = { 1: sliver }
    const expectedAction = {
      type: MODIFY_SLIVERS,
      payload: slivers
    }
    expect(modifySlivers(slivers)).toEqual(expectedAction)
  })

  it('should remove sliver', () => {
    const keys = [1]
    const expectedAction = {
      type: REMOVE_SLIVERS,
      payload: keys
    }
    expect(removeSlivers([1])).toEqual(expectedAction)
  })

  it('should reset slivers', () => {
    const sliver = new AssetSearch({query: 'foo'})
    const slivers = { 1: sliver }
    const expectedAction = {
      type: RESET_SLIVERS,
      payload: slivers
    }
    expect(resetSlivers(slivers)).toEqual(expectedAction)
  })
})
