/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import Scrubber from './Scrubber'
import { PubSub } from '../../services/jsUtil'

describe('<Scrubber />', () => {
  const status = new PubSub()
  const scrubberComponent = shallow(<Scrubber status={status} />)

  it('Should indicate the amount of progress that has elapsed', () => {
    status.publish('elapsedPercent', 0)
    expect(scrubberComponent.state('elapsedPercent')).toBe(0)
    status.publish('elapsedPercent', 0.5)
    expect(scrubberComponent.state('elapsedPercent')).toBe(0.5)
    status.publish('elapsedPercent', 1)
    expect(scrubberComponent.state('elapsedPercent')).toBe(1)
  })
})
