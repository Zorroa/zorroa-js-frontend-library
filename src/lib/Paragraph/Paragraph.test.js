/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Paragraph from './Paragraph'

configure({ adapter: new Adapter() })

describe('<Paragraph />', () => {
  describe('With no props', () => {
    const defaultParagraph = shallow(
      <Paragraph>
        Bacon ipsum dolor amet frankfurter drumstick shank turducken swine ball
        tip. Rump hamburger pancetta turkey pig meatloaf.
      </Paragraph>,
    )

    it('Should have a Paragraph--normal class', () => {
      expect(defaultParagraph.is('.Paragraph--normal')).toBe(true)
    })

    it('Should have text', () => {
      expect(defaultParagraph.text('Test')).toEqual(
        'Bacon ipsum dolor amet frankfurter drumstick shank turducken swine ball tip. Rump hamburger pancetta turkey pig meatloaf.',
      )
    })
  })

  describe('With large size', () => {
    const opinionatedParagraph = shallow(
      <Paragraph size="large">
        Tenderloin prosciutto tail tri-tip kielbasa sirloin, pork chop turducken
        pork cow salami short ribs ham pig.
      </Paragraph>,
    )

    it('Should have a Paragraph--large class', () => {
      expect(opinionatedParagraph.is('.Paragraph--large')).toBe(true)
    })
  })
})
