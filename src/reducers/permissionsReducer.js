import { GET_ALL_PERMISSIONS, UNAUTH_USER } from '../constants/actionTypes'

export const initialState = {
  all: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ALL_PERMISSIONS:
      return { ...state, all: action.payload }
    case UNAUTH_USER:
      return initialState
  }
  return state
}
