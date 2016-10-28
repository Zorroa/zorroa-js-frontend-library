import { MODIFY_SLIVERS, REMOVE_SLIVERS, RESET_SLIVERS } from '../constants/actionTypes'

// Slivers store an AssetSearch for each selected folder or racetrack widget.
// Slivers are combined together using AssetSearch.merge to generate a master search.
export default function (state = {}, action) {
  let slivers = { ...state }
  switch (action.type) {
    case MODIFY_SLIVERS: {
      for (let key in action.payload) {
        if (!action.payload.hasOwnProperty(key)) continue
        slivers[key] = action.payload[key]
      }
      return slivers
    }
    case REMOVE_SLIVERS: {
      for (let key of action.payload) {
        delete slivers[key]
      }
      return slivers
    }
    case RESET_SLIVERS: {
      return action.payload ? action.payload : {}
    }
  }

  return state
}
