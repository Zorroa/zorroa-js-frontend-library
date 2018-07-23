/* eslint-env jest */

import React from 'react'
import renderer from 'react-test-renderer'
import DropdownMenu from './DropdownMenu'

describe('<DropdownMenu />', () => {
  it('It should render the proper markup', () => {
    const tree = renderer.create(<DropdownMenu dark={false} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
