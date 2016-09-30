import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Link } from 'react-router'
import Header from './Header'

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

describe('<Header/>', () => {
  let header

  beforeEach(() => {
    const store = storeFake({ auth: { authenticated: true } })
    const wrapper = mount(
      <Provider store={store}>
        <Header/>
      </Provider>
    )

    header = wrapper.find(Header)
  })

  it('true should be true', () => {
    expect(true).toBe(true)
  })

  it('should render', () => {
    expect(header.length).toBeTruthy()
  })

  it('should render an <Link/>', () => {
    expect(header.find(Link)).toBeTruthy()
  })
})
