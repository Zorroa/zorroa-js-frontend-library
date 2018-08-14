/* eslint-env jest */

import React from 'react'
import {
  FlipbookWidgetFrameRateChanger,
  mapStateToProps,
} from './FlipbookWidgetFrameRateChanger'
import renderer from 'react-test-renderer'

function generateActions() {
  const setFlipbookFps = jest.fn()
  const actions = {
    setFlipbookFps,
  }

  return actions
}

function generateProps(customProps) {
  return {
    setFlipbookFps: 12,
    actions: generateActions(),
    ...customProps,
  }
}

describe('<FlipbookWidgetFrameRateChanger />', () => {
  describe('mapStateToProps', () => {
    it('Should map the state to a new, simpler object', () => {
      expect(
        mapStateToProps({
          app: {
            flipbookFps: 12,
          },
        }),
      ).toEqual({
        fps: 12,
      })
    })
  })

  describe('At 12 FPS', () => {
    it('Should render the toggle bar a third of the way through', () => {
      const props = generateProps()
      const tree = renderer
        .create(<FlipbookWidgetFrameRateChanger {...props} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('At 24 FPS', () => {
    it('Should render the toggle bar half of the way through', () => {
      const props = generateProps({
        fps: 24,
      })
      const tree = renderer
        .create(<FlipbookWidgetFrameRateChanger {...props} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('At 30 FPS', () => {
    it('Should render the toggle bar all the way through', () => {
      const props = generateProps({
        fps: 30,
      })
      const tree = renderer
        .create(<FlipbookWidgetFrameRateChanger {...props} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
