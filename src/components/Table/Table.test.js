/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Table from './Table'
import Asset from '../../models/Asset'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
})

function generateActions() {
  const showMetaContextMenu = jest.fn()
  const showTableContextMenu = jest.fn()

  const actions = {
    showMetaContextMenu,
    showTableContextMenu,
  }

  return actions
}

function generateRequiredProps(customProps) {
  return {
    actions: generateActions(),
    assets: [],
    assetsCounter: 0,
    selectionCounter: 0,
    selectedAssetIds: new Set(),
    fields: [],
    keyColor: 'white',
    whiteLabelEnabled: true,
    height: 1,
    tableIsResizing: true,
    selectFn: jest.fn(),
    elementFn: jest.fn(),
    ...customProps,
  }
}

describe('<Table />', () => {
  describe('toggleMetaContextMenu()', () => {
    it('Should select asset and call showMetaContextMenu()', () => {
      const props = generateRequiredProps({
        assets: [
          new Asset({ id: 'a' }),
          new Asset({ id: 'b' }),
          new Asset({ id: 'c' }),
        ],
      })
      const component = shallow(<Table {...props} />)
      const asset = component.instance().props.assets[0]
      const event = {
        preventDefault: () => {},
        pageX: 0,
        pageY: 0,
      }
      component.instance().toggleMetaContextMenu(event, asset)
      expect(props.selectFn).toBeCalledWith(asset, event)
      expect(props.actions.showMetaContextMenu).toBeCalledWith({ x: 0, y: 0 })
    })
  })
})
