/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import wrapSignedStream from './SignedStream'
import Asset from '../../models/Asset'

function DummyComponent() {
  return null
}

describe('<SignedStream />', () => {
  describe('fetchSignedUrlSuccess()', () => {
    describe('When the response includes a signed URL', () => {
      it('Should set the signed URL', () => {
        const asset = new Asset({
          id: '1-a',
          document: {},
        })
        const SignedStream = wrapSignedStream(DummyComponent)
        const component = shallow(
          <SignedStream asset={asset} origin="https://cdv.irm.com" />,
        )
        component.instance().fetchSignedUrlSuccess({
          signedUrl: 'https://cdv.irm.com/asset.mp4?key=l33t',
        })
        expect(component.state('signedAssetUrl')).toBe(
          'https://cdv.irm.com/asset.mp4?key=l33t',
        )
        expect(component.state('hasSignedUrl')).toBe(true)
        expect(component.state('loadState')).toBe('LOAD_STATE_SUCCESS')
      })
    })

    describe('When the response includes no signed URL', () => {
      it('Should set the signed URL to the default URL', () => {
        const asset = new Asset({
          id: '2-b',
          document: {},
        })
        const SignedStream = wrapSignedStream(DummyComponent)
        const component = shallow(
          <SignedStream asset={asset} origin="https://cdv.irm.com" />,
        )
        component.instance().fetchSignedUrlSuccess({
          signedUrl: undefined,
        })
        expect(component.state('signedAssetUrl')).toBe(
          'https://cdv.irm.com/api/v1/assets/2-b/_stream',
        )
        expect(component.state('hasSignedUrl')).toBe(false)
        expect(component.state('loadState')).toBe('LOAD_STATE_SUCCESS')
      })
    })
  })
})
