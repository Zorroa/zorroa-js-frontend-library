/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import ToggleButton from './ToggleButton'

configure({ adapter: new Adapter() })

describe('<ToggleButton />', () => {
  describe('onClick()', () => {
    it('should toggle the `isOpen` state', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }
      const component = shallow(<ToggleButton dark={true} />)
      component.instance().onClick(event)
      expect(component.state('isOpen')).toBe(true)
    })
  })

  describe('handleDocumentClick()', () => {
    it('should close the menu', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      }
      const component = shallow(<ToggleButton dark={true} />)
      component.instance().onClick(event)
      expect(component.instance().isOpen()).toBe(true)
      component.instance().handleDocumentClick(event)
      expect(component.instance().isOpen()).toBe(false)
    })
  })

  describe('isDark()', () => {
    it('should return true when the theme is dark', () => {
      const component = shallow(<ToggleButton dark={true} />)
      expect(component.instance().isDark()).toBe(true)
    })

    it('should return false when the theme is dark', () => {
      const component = shallow(<ToggleButton dark={false} />)
      expect(component.instance().isDark()).toBe(false)
    })
  })
})
