/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import renderer from 'react-test-renderer'
import Footer from './Footer'
import User from '../../../models/User'

configure({ adapter: new Adapter() })

function generateActions() {
  const setThumbSize = jest.fn()
  const setThumbLayout = jest.fn()
  const showTable = jest.fn()
  const saveUserSettings = jest.fn()
  const actions = {
    setThumbSize,
    setThumbLayout,
    showTable,
    saveUserSettings,
  }

  return actions
}

function generateProps(customProps) {
  return {
    actions: generateActions(),
    showTable: true,
    layout: 'masonry',
    handleLayout: jest.fn(),
    thumbSize: 200,
    user: new User({ id: 'b' }),
    userSettings: {},
    ...customProps,
  }
}

describe('<Footer />', () => {
  describe('toggleShowTable()', () => {
    it('Should toggle the table to the oposite of the current value', () => {
      const props = generateProps()
      const component = shallow(<Footer {...props} />)
      component.instance().toggleShowTable()
      const showTable = props.actions.showTable.mock.calls[0][0]
      expect(showTable).toBe(false)
    })
  })

  describe('handleLayout()', () => {
    it('Should not crash when no handler is defined', () => {
      const props = generateProps()
      props.handleLayout = undefined
      const component = shallow(<Footer {...props} />)
      component.instance().handleLayout()
    })

    it('Should call the handler when it is defined', () => {
      const props = generateProps()
      const handleLayout = props.handleLayout
      const component = shallow(<Footer {...props} />)
      component.instance().handleLayout()
      expect(handleLayout.mock.calls.length).toBe(1)
    })
  })

  describe('changeLayout()', () => {
    it('Should not call `handleLayout()` if the layout name the same', () => {
      const props = generateProps()
      const component = shallow(<Footer {...props} />)
      component.instance().changeLayout('masonry')
      expect(props.handleLayout.mock.calls.length).toBe(0)
    })

    it('Should call `handleLayout()` when the layout name is different', () => {
      const props = generateProps()
      const handleLayout = props.handleLayout
      const component = shallow(<Footer {...props} />)
      component.instance().changeLayout('grid')
      expect(handleLayout.mock.calls.length).toBe(1)
    })
  })

  describe('changeThumbSize()', () => {
    it('Should not call `handleLayout()` if the thumbnail size is the same', () => {
      const props = generateProps()
      const component = shallow(<Footer {...props} />)
      component.instance().changeThumbSize(200)
      expect(props.handleLayout.mock.calls.length).toBe(0)
    })

    it('Should not call `handleLayout()` if the thumbnail size is not a number', () => {
      const props = generateProps()
      const component = shallow(<Footer {...props} />)
      component.instance().changeThumbSize('200')
      expect(props.handleLayout.mock.calls.length).toBe(0)
    })

    it('Should call `handleLayout()` when the thumbnail size is different', () => {
      const props = generateProps()
      const handleLayout = props.handleLayout
      const component = shallow(<Footer {...props} />)
      component.instance().changeThumbSize(300)
      expect(handleLayout.mock.calls.length).toBe(1)
    })
  })

  describe('render()', () => {
    const props = generateProps()
    const tree = renderer.create(<Footer {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
