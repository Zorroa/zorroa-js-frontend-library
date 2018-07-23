/* eslint-env jest */

import React from 'react'
import renderer from 'react-test-renderer'
import DropdownGroup from './DropdownGroup'

describe('<DropdownGroup />', () => {
  it('It should render the proper markup', () => {
    const tree = renderer.create(<DropdownGroup dark={false} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
