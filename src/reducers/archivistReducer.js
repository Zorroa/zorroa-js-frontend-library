import { ARCHIVIST_INFO, ARCHIVIST_HEALTH, ARCHIVIST_METRICS, ARCHIVIST_ALL_SETTINGS } from '../constants/actionTypes'

const initialState = {
  info: null,
  health: null,
  metrics: null
}

export default function archivist (state = initialState, action) {
  switch (action.type) {
    case ARCHIVIST_INFO:
      return { ...state, info: action.payload }
    case ARCHIVIST_HEALTH:
      return { ...state, health: action.payload }
    case ARCHIVIST_METRICS:
      return { ...state, metrics: action.payload }
    case ARCHIVIST_ALL_SETTINGS:
      return { ...state, settings: action.payload }
  }
  return state
}
