import { SET_DARK_MODE } from '../constants/actionTypes'

export function toggleDarkMode({ isDark }) {
  return {
    type: SET_DARK_MODE,
    payload: isDark,
  }
}
