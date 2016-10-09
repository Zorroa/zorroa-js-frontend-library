import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import App from './App'
import Header from '../Header'

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

describe('<App/>', () => {
  let app

  beforeEach(() => {
    const store = storeFake({ auth: { authenticated: true } })
    const wrapper = mount(
      <Provider store={store}>
        <App/>
      </Provider>
    )

    app = wrapper.find(App)
  })

  it('true should be true', () => {
    expect(true).toBe(true)
  })

  it('should render', () => {
    expect(app.length).toBeTruthy()
  })

  it('should render an <Header/>', () => {
    expect(app.find(Header)).toBeTruthy()
  })
})
