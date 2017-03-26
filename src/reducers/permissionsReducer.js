import { GET_ALL_PERMISSIONS, UNAUTH_USER } from '../constants/actionTypes'

import Permission from '../models/Permission'

export const initialState = {
  all: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ALL_PERMISSIONS: {
      const all = action.payload
      let isAdministrator = false
      let isDeveloper = false
      let isManager = false
      all && all.forEach(permission => {
        if (permission.equals(Permission.Administrator, Permission.GroupType)) isAdministrator = true
        if (permission.equals(Permission.Developer, Permission.GroupType)) isDeveloper = true
        if (permission.equals(Permission.Manager, Permission.GroupType)) isManager = true
      })
      return {...state, all, isAdministrator, isManager, isDeveloper}
    }
    case UNAUTH_USER:
      return initialState
  }
  return state
}
