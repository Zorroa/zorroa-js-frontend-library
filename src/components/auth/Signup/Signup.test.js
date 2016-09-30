import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Link } from 'react-router'
import Signup from './Signup'

const storeFake = (state) => {
  return {
    default: () => {},
    subscribe: () => {},
    dispatch: () => {},
    getState: () => {
      return Object.assign({}, state)
    }
  }
}

describe('<Signup/>', () => {
  let signup

  beforeEach(() => {
    const store = storeFake({ auth: { authenticated: true } })
    const wrapper = mount(
      <Provider store={store}>
        <Signup/>
      </Provider>
    )

    signup = wrapper.find(Signup)
  })

  it('true should be true', () => {
    expect(true).toBe(true)
  })

  it('should render', () => {
    expect(signup.length).toBeTruthy()
  })

  it('should render an <Link/>', () => {
    expect(signup.find(Link)).toBeTruthy()
  })
})
