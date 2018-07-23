/* eslint-env jest */

import React from 'react'
import renderer from 'react-test-renderer'
import DropdownFontIcon from './DropdownFontIcon'

describe('<DropdownFontIcon />', () => {
  it('It should render the proper markup', () => {
    const tree = renderer
      .create(<DropdownFontIcon icon="icon-move-left" dark={false} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
