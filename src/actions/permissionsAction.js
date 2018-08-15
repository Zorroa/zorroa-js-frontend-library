import { GET_ALL_PERMISSIONS } from '../constants/actionTypes'
import Permission from '../models/Permission'
import { archivistGet } from './authAction'

const rootEndpoint = '/api/v1/permissions'

export function getAllPermissions() {
  return dispatch => {
    archivistGet(dispatch, rootEndpoint)
      .then(response => {
        const permissions = response.data.map(json => new Permission(json))
        dispatch({
          type: GET_ALL_PERMISSIONS,
          payload: permissions,
        })
      })
      .catch(error => {
        console.error('Error getting permissions: ' + error)
      })
  }
}
