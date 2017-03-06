import React from 'react'
import { mount } from 'enzyme'
import Logo from './Logo'

// These are defined by webpack
// TODO: figure out how to have the webpack config define these for tests
window.zvVersion = '0.0.0'

describe('<Logo />', () => {
  let logo

  beforeEach(() => {
    logo = mount(<Logo />)
  })

  it('should render', () => {
    expect(logo.length).toBeTruthy()
  })
})
