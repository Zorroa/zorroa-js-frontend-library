import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Link } from 'react-router'
import Signin from './Signin'

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

describe('<Signin/>', () => {
  let signin

  beforeEach(() => {
    const store = storeFake({ auth: { authenticated: true } })
    const wrapper = mount(
      <Provider store={store}>
        <Signin/>
      </Provider>
    )

    signin = wrapper.find(Signin)
  })

  it('true should be true', () => {
    expect(true).toBe(true)
  })

  it('should render', () => {
    expect(signin.length).toBeTruthy()
  })

  it('should render an <Link/>', () => {
    expect(signin.find(Link)).toBeTruthy()
  })
})
