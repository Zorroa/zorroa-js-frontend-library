import {
  LOAD_THEME,
  LOAD_THEME_SUCCESS,
  LOAD_THEME_ERROR,
  SAVE_THEME,
  SAVE_THEME_SUCCESS,
  SAVE_THEME_ERROR,
} from '../constants/actionTypes'
import { KEY_COLOR, LIGHT_LOGO, DARK_LOGO } from '../constants/themeDefaults'

const STATE_PENDING = 'pending'
const STATE_FAILED = 'failed'
const STATE_SUCCEEDED = 'succeeded'

const initialState = {
  themeLoadState: STATE_PENDING,
  themeSaveState: STATE_SUCCEEDED,
  whiteLabelEnabled: false,
  darkLogo: DARK_LOGO,
  lightLogo: LIGHT_LOGO,
  keyColor: KEY_COLOR,
  tutorialUrl: '',
  releaseNotesUrl: '',
  faqUrl: '',
  supportUrl: '',
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SAVE_THEME: {
      const themeSaveState = STATE_PENDING
      return {
        ...state,
        themeSaveState,
      }
    }
    case SAVE_THEME_SUCCESS: {
      const themeSaveState = STATE_SUCCEEDED
      return {
        ...state,
        themeSaveState,
      }
    }
    case SAVE_THEME_ERROR: {
      const themeSaveState = STATE_FAILED
      return {
        ...state,
        themeSaveState,
      }
    }
    case LOAD_THEME: {
      const themeLoadState = STATE_PENDING
      return {
        ...state,
        themeLoadState,
      }
    }
    case LOAD_THEME_SUCCESS: {
      const themeLoadState = STATE_SUCCEEDED
      const {
        darkLogo,
        lightLogo,
        keyColor,
        tutorialUrl,
        releaseNotesUrl,
        faqUrl,
        supportUrl,
        whiteLabelEnabled,
      } = action.payload
      return {
        ...state,
        darkLogo,
        lightLogo,
        keyColor,
        themeLoadState,
        tutorialUrl,
        releaseNotesUrl,
        faqUrl,
        supportUrl,
        whiteLabelEnabled,
      }
    }
    case LOAD_THEME_ERROR: {
      const themeLoadState = STATE_FAILED
      return {
        ...state,
        themeLoadState,
      }
    }
  }

  return state
}
