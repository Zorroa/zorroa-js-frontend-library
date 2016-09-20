import React from 'react'
import { mount } from 'enzyme'
import ExampleBox from './ExampleBox'

describe('<ExampleBox />', () => {
  const testLabel = 'Heeey you guuys'
  let exampleBox

  beforeEach(() => {
    exampleBox = mount(<ExampleBox label={testLabel} />)
  })

  it('true should be true', () => {
    expect(true).toBe(true)
  })

  it('should render', () => {
    expect(exampleBox.length).toBeTruthy()
  })

  it('should have props defined', () => {
    expect(exampleBox.prop('label')).toBe.defined
  })

  it('should have the correct props', () => {
    expect(exampleBox.prop('label')).toBe(testLabel)
  })
})
