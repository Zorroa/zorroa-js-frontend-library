import { ARCHIVIST_INFO, ARCHIVIST_HEALTH, ARCHIVIST_METRICS, ARCHIVIST_SETTING } from '../constants/actionTypes'

const initialState = {
  info: null,
  health: null,
  metrics: null,
  settings: {}
}

export default function archivist (state = initialState, action) {
  switch (action.type) {
    case ARCHIVIST_INFO:
      return { ...state, info: action.payload }
    case ARCHIVIST_HEALTH:
      return { ...state, health: action.payload }
    case ARCHIVIST_METRICS:
      return { ...state, metrics: action.payload }
    case ARCHIVIST_SETTING: {
      const settings = { ...state.settings }
      settings[action.payload.name] = action.payload
      return { ...state, settings }
    }
  }
  return state
}
