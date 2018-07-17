import React from 'react'
import { mount } from 'enzyme'
import Logo from './Logo'

// These are defined by webpack
// TODO: figure out how to have the webpack config define these for tests
window.zvVersion = '0.0.0'

describe('<Logo />', () => {
  let logo

  beforeEach(() => {
    logo = mount(
      <Logo
        dark={true}
        darkLogo="%27%3Csvg%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23000%22%20%2F%3E%3C%2Fsvg%3E%27>"
        lightLogo="%27%3Csvg%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%20%2F%3E%3C%2Fsvg%3E%27>"
      />,
    )
  })

  it('should render', () => {
    expect(logo.length).toBeTruthy()
  })
})
