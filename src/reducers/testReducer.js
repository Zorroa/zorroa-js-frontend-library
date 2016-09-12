import { SYNC_CLICK, ASYNC_CLICK } from '../actions/testAction'

export default function (previousState = '', action) {
  switch (action.type) {
    case SYNC_CLICK:
      return action.payload
    case ASYNC_CLICK:
      return action.payload
    default:
      return previousState
  }
}
