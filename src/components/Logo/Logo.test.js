/* eslint-env jest */
import React from 'react'
import { shallow, mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Logo from './Logo'

configure({ adapter: new Adapter() })

describe('<Logo />', () => {
  it('should render', () => {
    const logo = mount(
      <Logo
        dark={true}
        whiteLabelEnabled={false}
        darkLogo="%27%3Csvg%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23000%22%20%2F%3E%3C%2Fsvg%3E%27>"
        lightLogo="%27%3Csvg%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%20%2F%3E%3C%2Fsvg%3E%27>"
      />,
    )
    expect(logo.length).toBeTruthy()
  })

  describe('recursiveDecode()', () => {
    it('should decode encoded logo', () => {
      const component = shallow(
        <Logo
          dark={false}
          whiteLabelEnabled={true}
          darkLogo="%3Csvg%3E%3C%2Fsvg%3E"
        />,
      )
      const logo = component.instance().props.darkLogo
      expect(component.instance().recursiveDecode(logo)).toEqual('<svg></svg>')
    })
  })

  describe('generateLogoSrc()', () => {
    describe('decoded logo', () => {
      it('Should render', () => {
        const component = mount(
          <Logo
            dark={false}
            whiteLabelEnabled={true}
            darkLogo="<svg></svg>"
            lightLogo="<svg></svg>"
          />,
        )

        const logo = component.instance().generateLogoSrc()
        expect(logo).toBe('data:image/svg+xml;utf8,%3Csvg%3E%3C%2Fsvg%3E')
      })
    })
    describe('encoded logo', () => {
      it('should render', () => {
        const component = mount(
          <Logo
            dark={false}
            whiteLabelEnabled={true}
            darkLogo="%3Csvg%3E%3C%2Fsvg%3E"
            lightLogo="%3Csvg%3E%3C%2Fsvg%3E"
          />,
        )

        const logo = component.instance().generateLogoSrc()
        expect(logo).toBe('data:image/svg+xml;utf8,%3Csvg%3E%3C%2Fsvg%3E')
      })
    })
  })
})
