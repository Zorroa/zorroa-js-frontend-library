/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'
import Scrubber from './Scrubber'

describe('<Scrubber />', () => {
  describe('With no PubSub props', () => {
    const scrubberComponent = mount(
      <Scrubber currentFrameNumber={5} totalFrames={10} />,
    )

    it('Should have the current frame number as a title', () => {
      expect(
        scrubberComponent
          .getDOMNode()
          .querySelector('.Scrubber__progress')
          .attributes.getNamedItem('title').value,
      ).toBe('Frame 5')
    })
  })
})
