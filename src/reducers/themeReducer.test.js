import {
  LOAD_THEME,
  LOAD_THEME_SUCCESS,
  LOAD_THEME_ERROR,
  SAVE_THEME,
  SAVE_THEME_SUCCESS,
  SAVE_THEME_ERROR,
} from '../constants/actionTypes'
import themeReducer from './themeReducer'

describe('themeReducer', () => {
  describe(SAVE_THEME, () => {
    it('Should set the save state to pending', () => {
      const loadThemeAction = {
        type: SAVE_THEME,
        payload: undefined,
      }
      expect(themeReducer({}, loadThemeAction)).toEqual({
        themeSaveState: 'pending',
      })
    })
  })

  describe(SAVE_THEME_SUCCESS, () => {
    it('Should set the save state to pending', () => {
      const loadThemeAction = {
        type: SAVE_THEME_SUCCESS,
        payload: undefined,
      }
      expect(themeReducer({}, loadThemeAction)).toEqual({
        themeSaveState: 'succeeded',
      })
    })
  })

  describe(SAVE_THEME_ERROR, () => {
    it('Should set the save state to failed', () => {
      const loadThemeAction = {
        type: SAVE_THEME_ERROR,
        payload: undefined,
      }
      expect(themeReducer({}, loadThemeAction)).toEqual({
        themeSaveState: 'failed',
      })
    })
  })

  describe(LOAD_THEME, () => {
    it('Should set the load state to pending', () => {
      const loadThemeAction = {
        type: LOAD_THEME,
        payload: undefined,
      }
      expect(themeReducer({}, loadThemeAction)).toEqual({
        themeLoadState: 'pending',
      })
    })
  })

  describe(LOAD_THEME_SUCCESS, () => {
    const loadThemeSuccessAction = {
      type: LOAD_THEME_SUCCESS,
      payload: {
        keyColor: '#000',
        darkLogo:
          '<svg><rect x="0" y="0" width="1" height="1" fill="#fff" /></svg>',
        lightLogo:
          '<svg><rect x="0" y="0" width="1" height="1" fill="#000" /></svg>',
        supportUrl: 'https://supportUrl.org',
        faqUrl: 'https://faqUrl.org',
        releaseNotesUrl: 'https://releaseNotesUrl.net',
        tutorialUrl: 'https://tutorialUrl.com',
        whiteLabelEnabled: true,
      },
    }

    it('Should set the load state to success', () => {
      expect(themeReducer({}, loadThemeSuccessAction).themeLoadState).toEqual(
        'succeeded',
      )
    })

    it('Should set the dark logo', () => {
      expect(themeReducer({}, loadThemeSuccessAction).darkLogo).toEqual(
        '<svg><rect x="0" y="0" width="1" height="1" fill="#fff" /></svg>',
      )
    })

    it('Should set the light logo', () => {
      expect(themeReducer({}, loadThemeSuccessAction).lightLogo).toEqual(
        '<svg><rect x="0" y="0" width="1" height="1" fill="#000" /></svg>',
      )
    })

    it('Should set the key color', () => {
      expect(themeReducer({}, loadThemeSuccessAction).keyColor).toEqual('#000')
    })

    it('Should set the tutorialUrl', () => {
      expect(themeReducer({}, loadThemeSuccessAction).tutorialUrl).toEqual(
        'https://tutorialUrl.com',
      )
    })

    it('Should set the releaseNotesUrl', () => {
      expect(themeReducer({}, loadThemeSuccessAction).releaseNotesUrl).toEqual(
        'https://releaseNotesUrl.net',
      )
    })

    it('Should set the faqUrl', () => {
      expect(themeReducer({}, loadThemeSuccessAction).faqUrl).toEqual(
        'https://faqUrl.org',
      )
    })

    it('Should set the supportUrl', () => {
      expect(themeReducer({}, loadThemeSuccessAction).supportUrl).toEqual(
        'https://supportUrl.org',
      )
    })

    it('Should set the white label to be enabled', () => {
      expect(themeReducer({}, loadThemeSuccessAction).whiteLabelEnabled).toBe(
        true,
      )
    })
  })

  describe(LOAD_THEME_ERROR, () => {
    it('Set the load state to pending', () => {
      const loadThemeErrorAction = {
        type: LOAD_THEME_ERROR,
        payload: undefined,
      }
      expect(themeReducer({}, loadThemeErrorAction).themeLoadState).toEqual(
        'failed',
      )
    })
  })
})
