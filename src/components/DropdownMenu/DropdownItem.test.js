/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import DropdownItem from './DropdownItem'

describe('<DropdownItem />', () => {
  describe('handleClick()', () => {
    it('Should not crash when no click handler is defined', () => {
      const event = {}
      const component = shallow(<DropdownItem dark={true} />)
      component.instance().handleClick(event)
    })

    it('Should call the click handler', () => {
      const onClick = jest.fn()
      const event = {}
      const component = shallow(<DropdownItem onClick={onClick} dark={true} />)
      component.instance().handleClick(event)
      expect(onClick.mock.calls.length).toBe(1)
    })
  })

  describe('render()', () => {
    describe('When there is no handler', () => {
      it('Should have a disabled class', () => {
        const tree = renderer
          .create(<DropdownItem dark={false}>Move Left</DropdownItem>)
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('When in dark mode', () => {
      it('Should have a dark class', () => {
        const tree = renderer
          .create(<DropdownItem dark={true}>Preferences</DropdownItem>)
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })
})
