/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import AssetContextMenu from './AssetContextMenu'
import Asset from '../../../models/Asset'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
})

function generateRequiredProps(customProps) {
  return {
    contextMenuPos: { x: 0, y: 0 },
    onDismiss: jest.fn(),
    ...customProps,
  }
}

describe('<AssetContextMenu />', () => {
  describe('getMenuItems()', () => {
    it('Should return MenuItems', () => {
      const props = generateRequiredProps()
      const component = shallow(<AssetContextMenu {...props} />)
      const items = component.instance().getMenuItems()
      expect(items[0].label).toEqual('Download')
    })
  })

  describe('getAssets()', () => {
    it('Should return array of asset objects', () => {
      const props = generateRequiredProps({
        assets: [
          new Asset({ id: 'a' }),
          new Asset({ id: 'b' }),
          new Asset({ id: 'c' }),
        ],
        selectedIds: new Set(['a']),
      })
      const component = shallow(<AssetContextMenu {...props} />)
      const assetsArray = component.instance().getAssets()
      expect(assetsArray.length).toBe(1)
      expect(assetsArray[0]).toBeInstanceOf(Asset)
    })
  })

  describe('getAssetURL()', () => {
    describe('With no asset', () => {
      it('Should return null', () => {
        const props = generateRequiredProps({
          origin: 'https://localhost:8081',
        })
        const asset = new Asset({ id: 'a' })
        const component = shallow(<AssetContextMenu {...props} />)
        const assetURL = component.instance().getAssetURL(asset)
        expect(assetURL).toEqual(
          'https://localhost:8081/api/v1/assets/a/_stream',
        )
      })
    })

    describe('With asset', () => {
      it('Should return blob', () => {
        const props = generateRequiredProps({
          origin: 'https://localhost:8081',
        })
        const component = shallow(<AssetContextMenu {...props} />)
        const assetdURL = component.instance().getAssetURL()
        expect(assetdURL).toBe(null)
      })
    })
  })
})
