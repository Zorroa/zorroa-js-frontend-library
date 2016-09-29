import React from 'react'
import { mount } from 'enzyme'
import Logo from './Logo'

describe('<Logo />', () => {
  let logo

  beforeEach(() => {
    logo = mount(<Logo />)
  })

  it('should render', () => {
    expect(logo.length).toBeTruthy()
  })
})
