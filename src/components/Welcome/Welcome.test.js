import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import Welcome from './Welcome'

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

describe('<Welcome/>', () => {
  let welcome

  beforeEach(() => {
    const store = storeFake({ auth: { authenticated: true } })
    const wrapper = mount(
      <Provider store={store}>
        <Welcome/>
      </Provider>
    )

    welcome = wrapper.find(Welcome)
  })

  it('true should be true', () => {
    expect(true).toBe(true)
  })

  it('should render', () => {
    expect(welcome.length).toBeTruthy()
  })
})
