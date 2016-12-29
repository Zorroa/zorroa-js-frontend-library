import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

jest.mock('../Racetrack/Map')

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
    const store = storeFake({
      auth: {
        authenticated: true
      },
      app: {
        modal: {}
      }
    })

    const wrapper = mount(
      <Provider store={store}>
        <App/>
      </Provider>
    )

    app = wrapper.find(App)
  })

  it('should render', () => {
    expect(app.length).toBeTruthy()
  })

  it('should render an <Header/>', () => {
    expect(app.find(Header)).toBeTruthy()
  })
})
