import { BLOB_FEATURE_NAME_THEME, APP_NAME } from '../constants/general'
import {
  LOAD_THEME,
  LOAD_THEME_SUCCESS,
  LOAD_THEME_ERROR,
  SAVE_THEME,
  SAVE_THEME_SUCCESS,
  SAVE_THEME_ERROR,
} from '../constants/actionTypes'
import api from '../api'

const WHITE_LABEL_NAME = 'whitelabel'

export function saveTheme({
  keyColor,
  whiteLabelEnabled,
  tutorialUrl,
  releaseNotesUrl,
  faqUrl,
  supportUrl,
  lightLogo,
  darkLogo,
}) {
  return dispatch => {
    dispatch({
      type: SAVE_THEME,
      payload: {},
    })
    const request = {
      feature: BLOB_FEATURE_NAME_THEME,
      name: WHITE_LABEL_NAME,
      payload: {
        version: 1,
        keyColor,
        whiteLabelEnabled,
        tutorialUrl,
        releaseNotesUrl,
        faqUrl,
        supportUrl,
        lightLogo,
        darkLogo,
      },
    }
    api
      .blob(APP_NAME)
      .post(request)
      .then(
        response => {
          dispatch({
            type: SAVE_THEME_SUCCESS,
            payload: {},
          })
          dispatch({
            type: LOAD_THEME_SUCCESS,
            payload: {
              ...response,
            },
          })
        },
        errorResponse => {
          dispatch({
            type: SAVE_THEME_ERROR,
            payload: {
              errorResponse,
            },
          })
        },
      )
  }
}

export function fetchTheme() {
  return dispatch => {
    dispatch({
      type: LOAD_THEME,
    })

    api
      .blob(APP_NAME)
      .get({
        feature: BLOB_FEATURE_NAME_THEME,
        name: WHITE_LABEL_NAME,
      })
      .then(
        response => {
          dispatch({
            type: LOAD_THEME_SUCCESS,
            payload: response,
          })
        },
        errorResponse => {
          dispatch({
            type: LOAD_THEME_ERROR,
            payload: errorResponse,
          })
        },
      )
  }
}
