/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import FlipbookViewer from './FlipbookViewer.js'
import Asset from '../../models/Asset'
import User from '../../models/User'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
})

function generateActions() {
  const setFlipbookFps = jest.fn()
  const shouldLoop = jest.fn()
  const shouldHold = jest.fn()
  const lightboxMetadata = jest.fn()
  const saveUserSettings = jest.fn()

  const actions = {
    setFlipbookFps,
    shouldLoop,
    shouldHold,
    lightboxMetadata,
    saveUserSettings,
  }

  return actions
}

function generateRequiredProps(customProps) {
  return {
    actions: generateActions(),
    fps: 12,
    shouldLoop: false,
    shouldHold: false,
    clipParentId: 'a-1-b-2',
    lightboxMetadata: {
      show: false,
      left: 0,
      top: 0,
      width: 50,
      height: 75,
    },
    user: new User({ id: 'u-s-e-r-1-2-3' }),
    userSettings: {},
    isolatedAsset: new Asset({
      id: 'a-1-b-2',
      document: {
        media: {
          clip: {
            type: 'flipbook',
          },
        },
      },
    }),
    ...customProps,
  }
}

describe('<FlipbookViewer />', () => {
  describe('getDefaultFrameFromIsolatedAsset()', () => {
    it('Should get the default frame', () => {
      const props = generateRequiredProps()
      const component = shallow(<FlipbookViewer {...props} />)
      const defaultFrame = component
        .instance()
        .getDefaultFrameFromIsolatedAsset()
      expect(defaultFrame.id).toBe('a-1-b-2')
    })
  })

  describe('PubSub events', () => {
    describe('playedFlipbookFrame', () => {
      it('Should set the `playingFrame` to the activeFrame', () => {
        const props = generateRequiredProps()
        const component = shallow(<FlipbookViewer {...props} />)
        const nextFrame = new Asset({
          id: 'f-l-i-p',
          document: {},
        })
        let activeFrame
        component.instance().registerStatusEventHandlers()
        component.instance().status.on('playingFrame', frame => {
          activeFrame = frame
        })
        component.instance().status.publish('playingFrame', nextFrame)
        expect(activeFrame).toBe(nextFrame)
      })
    })
  })

  describe('toggleMetadata()', () => {
    it('Should set `show` to `true` if it was `false`', () => {
      const props = generateRequiredProps({})
      const component = shallow(<FlipbookViewer {...props} />)
      component.instance().toggleMetadata()
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      expect(lightboxMetadata.show).toBe(true)
    })

    it('Should set `show` to `flase if it was `true`', () => {
      const props = generateRequiredProps({
        lightboxMetadata: {
          show: true,
          left: 50,
          top: 50,
          width: 120,
          height: 200,
        },
      })
      const component = shallow(<FlipbookViewer {...props} />)
      component.instance().toggleMetadata()
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      expect(lightboxMetadata.show).toBe(false)
    })
  })

  describe('closeMetadata()', () => {
    it('Should set `show` to `false`', () => {
      const event = {
        stopPropagation: jest.fn(),
      }
      const props = generateRequiredProps({
        lightboxMetadata: {
          show: true,
          left: 50,
          top: 50,
          width: 120,
          height: 200,
        },
      })
      const component = shallow(<FlipbookViewer {...props} />)
      component.instance().closeMetadata(event)
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      const wasStopPropogationCalled =
        event.stopPropagation.mock.calls.length === 1
      expect(lightboxMetadata.show).toBe(false)
      expect(wasStopPropogationCalled).toBe(true)
    })
  })

  describe('moveMetadata()', () => {
    it('Should update the metadata coordinates', () => {
      const props = generateRequiredProps({
        lightboxMetadata: {
          show: true,
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        },
      })
      const component = shallow(<FlipbookViewer {...props} />)
      component.instance().moveMetadata({
        show: true,
        left: 50,
        top: 50,
        width: 120,
        height: 200,
      })
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      expect(lightboxMetadata.top).toBe(50)
      expect(lightboxMetadata.left).toBe(50)
      expect(lightboxMetadata.width).toBe(120)
      expect(lightboxMetadata.height).toBe(200)
    })
  })

  describe('shouldDisplayMetadata()', () => {
    describe('When there is no playing frame set', () => {
      it('Should be `false`', () => {
        const props = generateRequiredProps({
          lightboxMetadata: {
            show: true,
            left: 50,
            top: 50,
            width: 120,
            height: 200,
          },
        })
        const component = shallow(<FlipbookViewer {...props} />)
        const shouldDisplayMetadata = component
          .instance()
          .shouldDisplayMetadata()
        expect(shouldDisplayMetadata).toBe(false)
      })
    })

    describe('When the lightbox `show` property is false', () => {
      it('Should be `false`', () => {
        const props = generateRequiredProps({})
        const component = shallow(<FlipbookViewer {...props} />)
        const nextFrame = new Asset({
          id: 'f-l-i-p',
          document: {},
        })
        component.instance().status.publish('playingFrame', nextFrame)
        const shouldDisplayMetadata = component
          .instance()
          .shouldDisplayMetadata()
        expect(shouldDisplayMetadata).toBe(false)
      })
    })

    describe('When there is a playing frame and a lightbox should be displayed', () => {
      it('Should be `true`', () => {
        const props = generateRequiredProps({
          lightboxMetadata: {
            show: true,
            left: 50,
            top: 50,
            width: 120,
            height: 200,
          },
        })
        const component = shallow(<FlipbookViewer {...props} />)
        const nextFrame = new Asset({
          id: 'f-l-i-p',
          document: {},
        })
        component.instance().status.publish('playingFrame', nextFrame)
        const shouldDisplayMetadata = component
          .instance()
          .shouldDisplayMetadata()
        expect(shouldDisplayMetadata).toBe(false)
      })
    })
  })
})
