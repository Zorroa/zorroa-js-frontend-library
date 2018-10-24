/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Heading from './Heading'

configure({ adapter: new Adapter() })

describe('<Heading />', () => {
  describe('With no props', () => {
    const defaultHeading = shallow(<Heading>Test</Heading>)

    it('Should have a Heading--large class', () => {
      expect(defaultHeading.is('.Heading--large')).toBe(true)
    })

    it('Should have text', () => {
      expect(defaultHeading.text('Test')).toEqual('Test')
    })
  })

  describe('With H4 level and medium size', () => {
    const opinionatedHeading = shallow(
      <Heading level="h4" size="medium">
        Hello World
      </Heading>,
    )

    it('Should have a Heading--medium class', () => {
      expect(opinionatedHeading.is('.Heading--medium')).toBe(true)
    })

    it('Should have a H4 tag', () => {
      expect(opinionatedHeading.is('h4')).toBe(true)
    })
  })
})
