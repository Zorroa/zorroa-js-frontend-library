import { isolateAssetId, selectAssetIds } from './assetsAction'
import { ISOLATE_ASSET, SELECT_ASSETS } from '../constants/actionTypes'

jest.mock('../components/Racetrack/Map')

describe('assetsActions', () => {
  it('should isolate asset', () => {
    const id = '12345-abcde'
    const expectedAction = {
      type: ISOLATE_ASSET,
      payload: id,
    }
    expect(isolateAssetId(id)).toEqual(expectedAction)
  })

  it('should select assets', () => {
    const id = '12345-abcde'
    const ids = new Set([id])
    const expectedAction = {
      type: SELECT_ASSETS,
      payload: ids,
    }
    expect(selectAssetIds(ids)).toEqual(expectedAction)
  })
})
