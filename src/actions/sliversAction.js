import { MODIFY_SLIVERS, REMOVE_SLIVERS, RESET_SLIVERS } from '../constants/actionTypes'

export function modifySlivers (slivers) {
  return ({
    type: MODIFY_SLIVERS,
    payload: slivers
  })
}

export function removeSlivers (keys) {
  return ({
    type: REMOVE_SLIVERS,
    payload: keys
  })
}

export function resetSlivers (slivers) {
  return ({
    type: RESET_SLIVERS,
    payload: slivers
  })
}
