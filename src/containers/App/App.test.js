import React from 'react'
// import { render } from 'react-dom'
import App from './App'

import { expect } from 'chai'
import { mount, shallow } from 'enzyme'

describe('<App />', () => {
  const wrapper = mount(<App />)

  it('calls componentDidMount', () => {
    expect(App.prototype.componentDidMount.calledOnce).to.equal(true)
  })

  // it('should render', () => {
  //   const div = document.createElement('div')
  //   render(<App />, div)
  // })
})
