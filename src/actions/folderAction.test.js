import { SELECT_FOLDERS } from '../constants/actionTypes'
import { selectFolderIds } from './folderAction'
jest.mock('../components/Racetrack/Map')

// FIXME: Figure out how to test promise-based axios mock adapters!
describe('folderActions', () => {
  it('should select folder', () => {
    const id = 3
    const ids = new Set([id])
    const expectedAction = [
      {
        type: SELECT_FOLDERS,
        payload: ids,
      },
    ]
    expect(selectFolderIds(ids)).toEqual(expectedAction)
  })
})
