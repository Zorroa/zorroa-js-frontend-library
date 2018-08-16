/* eslint-env jest */
jest.mock('../Racetrack/Map')
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Lightbox from './Lightbox.js'
import User from '../../models/User'
import Asset from '../../models/Asset'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
})

function generateActions() {
  const isolateAssetId = jest.fn()
  const lightboxMetadata = jest.fn()
  const saveUserSettings = jest.fn()
  const searchAssets = jest.fn()

  const actions = {
    isolateAssetId,
    lightboxMetadata,
    saveUserSettings,
    searchAssets,
  }

  return actions
}

function generateRequiredProps(customProps) {
  return {
    actions: generateActions(),
    assets: [],
    match: {
      params: {
        isolatedId: 'c-2-d-3',
      },
    },
    fieldTypes: {
      'foo.bar': 'Bar',
    },
    lightboxMetadata: {
      show: false,
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    },
    user: new User({
      id: 'a-1-b-2',
    }),
    userSettings: {},
    history: {
      goBack: jest.fn(),
      push: jest.fn(),
    },
    ...customProps,
  }
}

describe('<Lightbox />', () => {
  describe('fetchAssetIfMissing()', () => {
    it('Should request a new asset if none is available in the assets list', () => {
      const props = generateRequiredProps()
      const component = shallow(<Lightbox {...props} />)
      const assetSearchId =
        props.actions.searchAssets.mock.calls[0][0].filter.terms._id[0]
      component.instance().fetchAssetIfMissing()
      expect(assetSearchId).toBe('c-2-d-3')
    })
    it('Should not request a new asset if an asset is available already', () => {
      const props = generateRequiredProps({
        assets: [
          new Asset({
            id: 'c-2-d-3',
            document: {},
          }),
        ],
      })
      const component = shallow(<Lightbox {...props} />)
      const wasNotCalled = props.actions.searchAssets.mock.calls.length === 0
      component.instance().fetchAssetIfMissing()
      expect(wasNotCalled).toBe(true)
    })
  })

  describe('toggleMetadata()', () => {
    it('Should show the metadata when it was previsouly hiding the metadata', () => {
      const props = generateRequiredProps({})
      const component = shallow(<Lightbox {...props} />)
      component.instance().toggleMetadata()
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      expect(lightboxMetadata.show).toBe(true)
    })

    it('Should hide the metadata when it was previsouly showing the metadata', () => {
      const props = generateRequiredProps({
        lightboxMetadata: {
          show: true,
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        },
      })
      const component = shallow(<Lightbox {...props} />)
      component.instance().toggleMetadata()
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      expect(lightboxMetadata.show).toBe(false)
    })
  })

  describe('closeMetadata()', () => {
    it('Should hide the metadata', () => {
      const event = {
        stopPropagation: jest.fn(),
      }
      const props = generateRequiredProps({
        lightboxMetadata: {
          show: true,
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        },
      })
      const component = shallow(<Lightbox {...props} />)
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
      const component = shallow(<Lightbox {...props} />)
      component.instance().moveMetadata({
        top: 2,
        left: 3,
        width: 97,
        height: 96,
      })
      component.update()
      const lightboxMetadata = props.actions.lightboxMetadata.mock.calls[0][0]
      expect(lightboxMetadata.top).toBe(2)
      expect(lightboxMetadata.left).toBe(3)
      expect(lightboxMetadata.width).toBe(97)
      expect(lightboxMetadata.height).toBe(96)
    })
  })

  describe('isolateIndexOffset()', () => {
    it('Should write a new history entry with the next asset ID', () => {
      const props = generateRequiredProps({
        assets: [
          new Asset({
            id: 'c-2-d-3',
            document: {},
          }),
          new Asset({
            id: 'd-3-e-4',
            document: {},
          }),
        ],
      })
      const component = shallow(<Lightbox {...props} />)
      component.instance().isolateIndexOffset(1)
      const nextUrl = props.history.push.mock.calls[0][0]
      expect(nextUrl).toBe('/asset/d-3-e-4')
    })
  })

  describe('getIsolatedAsset()', () => {
    it('Should return the entire isolated asset object', () => {
      const props = generateRequiredProps({
        assets: [
          new Asset({
            id: 'c-2-d-3',
            document: {},
          }),
        ],
      })
      const component = shallow(<Lightbox {...props} />)
      const asset = component.instance().getIsolatedAsset()
      expect(asset.id).toBe('c-2-d-3')
    })
  })

  describe('shouldDisplayLightboxMetadata()', () => {
    describe('When the isolated asset is a flipbook', () => {
      it('Should be false', () => {
        const props = generateRequiredProps({
          assets: [
            new Asset({
              id: 'c-2-d-3',
              document: {
                media: {
                  clip: {
                    type: 'flipbook',
                  },
                },
              },
            }),
          ],
          lightboxMetadata: {
            show: true,
          },
        })
        const component = shallow(<Lightbox {...props} />)
        const shouldDisplayLightboxMetadata = component
          .instance()
          .shouldDisplayLightboxMetadata()
        expect(shouldDisplayLightboxMetadata).toBe(false)
      })
    })

    describe('When the isolated asset is an image', () => {
      it('Should be true', () => {
        const props = generateRequiredProps({
          assets: [
            new Asset({
              id: 'c-2-d-3',
              document: {
                media: {},
              },
            }),
          ],
          lightboxMetadata: {
            show: true,
            left: 0,
            top: 0,
            width: 100,
            height: 100,
          },
        })
        const component = shallow(<Lightbox {...props} />)
        const shouldDisplayLightboxMetadata = component
          .instance()
          .shouldDisplayLightboxMetadata()
        expect(shouldDisplayLightboxMetadata).toBe(true)
      })
    })

    describe('When the ligthtbox metadata is turned off', () => {
      it('Should be false', () => {
        const props = generateRequiredProps({
          assets: [
            new Asset({
              id: 'c-2-d-3',
              document: {},
            }),
          ],
        })
        const component = shallow(<Lightbox {...props} />)
        const shouldDisplayLightboxMetadata = component
          .instance()
          .shouldDisplayLightboxMetadata()
        expect(shouldDisplayLightboxMetadata).toBe(false)
      })
    })

    describe('When the lightbox metadata is turned on', () => {
      it('Should be true', () => {
        const props = generateRequiredProps({
          assets: [
            new Asset({
              id: 'c-2-d-3',
              document: {},
            }),
          ],
          lightboxMetadata: {
            show: true,
            left: 0,
            top: 0,
            width: 100,
            height: 100,
          },
        })
        const component = shallow(<Lightbox {...props} />)
        const shouldDisplayLightboxMetadata = component
          .instance()
          .shouldDisplayLightboxMetadata()
        expect(shouldDisplayLightboxMetadata).toBe(true)
      })
    })
  })
})
