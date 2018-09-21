/* eslint-env jest */

import React from 'react'
import { configure } from 'enzyme'
import renderer from 'react-test-renderer'
import Adapter from 'enzyme-adapter-react-15'
import IntensityBar from './IntensityBar'

configure({ adapter: new Adapter() })

describe('<IntensityBar />', () => {
  describe('When the intensity is none', () => {
    it('Should render an empty bar', () => {
      const tree = renderer
        .create(<IntensityBar intensityPercent={0} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('When the intensity is over the defaul threshold', () => {
    it('Should render a bar indicating the threshold was reached', () => {
      const tree = renderer
        .create(<IntensityBar intensityPercent={90} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
