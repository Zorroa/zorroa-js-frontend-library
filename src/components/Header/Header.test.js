import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Link } from 'react-router'

jest.mock('../Racetrack/Map')

import Header from './Header'
import User from '../../models/User'

// These are defined by webpack
// TODO: figure out how to have the webpack config define these for tests
window.zvVersion = '0.0.0'

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
    const user = new User({id: 1, username: 'admin', firstName: 'Joe', lastName: 'Blow', enabled: true})
    const store = storeFake({ auth: { authenticated: true, user, sync: true }, app: { userSettings: {} } })
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
