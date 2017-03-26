import permissionsReducer from './permissionsReducer'
import { GET_ALL_PERMISSIONS } from '../constants/actionTypes'
import Permission from '../models/Permission'

describe('permissionsReducer', () => {
  it('GET_ALL_PERMISSIONS returns permissions', () => {
    const permissions = [
      new Permission({ id: 1, name: 'foo', type: 'bar', description: 'bam', immutable: true }),
      new Permission({ id: 3, name: 'zip', type: 'pow', description: 'boom', immutable: false })
    ]
    const action = { type: GET_ALL_PERMISSIONS, payload: permissions }
    expect(permissionsReducer({}, action))
      .toEqual({ all: permissions, isAdministrator: false, isDeveloper: false, isManager: false })
  })
})
