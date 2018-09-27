/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import ContextMenu from './ContextMenu'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: false,
})

function generateRequiredProps(customProps) {
  return {
    contextMenuPos: { x: 0, y: 0 },
    onDismissFn: jest.fn(),
    actions: {
      resetContextMenuPos: jest.fn(),
    },
    dark: false,
    items: [
      {
        icon: 'icon-download5',
        label: 'Download',
        disabled: () => false,
      },
    ],
    ...customProps,
  }
}

describe('<ContextMenu />', () => {
  describe('dismissOnClickOutside()', () => {
    describe('When the click is outside of the ContextMenu', () => {
      it('Should call the onDismissFn callback', () => {
        const props = generateRequiredProps()
        const component = shallow(<ContextMenu {...props} />)
        const componentInstance = component.instance()
        componentInstance.doesContextMenuRefNodeContainElement = jest
          .fn()
          .mockReturnValue(false)
        component.instance().dismissOnClickOutside({ target: undefined })

        expect(props.onDismissFn.mock.calls.length).toBe(1)
      })
    })

    describe('When the click is inside of the ContextMenu', () => {
      it('Should not call the onDismissFn callback', () => {
        const props = generateRequiredProps()
        const component = shallow(<ContextMenu {...props} />)
        const componentInstance = component.instance()
        componentInstance.doesContextMenuRefNodeContainElement = jest
          .fn()
          .mockReturnValue(true)
        component.instance().dismissOnClickOutside({ target: undefined })
        expect(props.onDismissFn.mock.calls.length).toBe(0)
      })
    })
  })
})
