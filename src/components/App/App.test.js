/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import App from './App'
jest.mock('../Workspace')
jest.mock('../Racetrack/Map')
configure({ adapter: new Adapter() })
function generateActions() {
  const fetchTheme = jest.fn()
  const samlOptionsRequest = jest.fn()
  const checkSession = jest.fn()
  const actions = {
    fetchTheme,
    samlOptionsRequest,
    checkSession,
  }
  return actions
}
function generateProps(customProps) {
  return {
    authenticated: true,
    themeLoadState: 'succeeded',
    actions: generateActions(),
    ...customProps,
  }
}

describe('<App />', () => {
  describe('setSessionExpiration()', () => {
    describe('When the user session expires (status code 401)', () => {
      it('Should call props.actions.checkSession()', () => {
        const props = generateProps({
          sessionExpired: false,
        })
        const component = shallow(<App {...props} />)
        const error = { response: { status: 401 } }
        component.instance().setSessionExpiration(error)
        expect(props.actions.checkSession).toBeCalled()
      })
    })

    describe('When the error status is not 401', () => {
      it('Should not call props.actions.checkSession()', () => {
        const props = generateProps({
          sessionExpired: false,
        })
        const component = shallow(<App {...props} />)
        const error = { response: { status: 403 } }
        component.instance().setSessionExpiration(error)
        expect(props.actions.checkSession.mock.calls.length).toBe(0)
      })
    })
  })
})

describe('<App />', () => {
  describe('shouldRecreateRootFolderId()', () => {
    describe('When the user went from  authenticated to un-authenticated', () => {
      it('Should be `false`', () => {
        const props = generateProps({
          authenticated: true,
        })
        const component = shallow(<App {...props} />)
        const shouldRecreateRootFolderId = component
          .instance()
          .shouldRecreateRootFolderId(props, {
            authenticated: false,
          })
        expect(shouldRecreateRootFolderId).toBe(false)
      })
    })
    describe('When the user never authenticated', () => {
      it('Should be `false`', () => {
        const props = generateProps({
          authenticated: false,
        })
        const component = shallow(<App {...props} />)
        const shouldRecreateRootFolderId = component
          .instance()
          .shouldRecreateRootFolderId(props, {
            authenticated: false,
          })
        expect(shouldRecreateRootFolderId).toBe(false)
      })
    })
    describe('When the user remained authenticated', () => {
      it('Should be `false`', () => {
        const props = generateProps({
          authenticated: true,
        })
        const component = shallow(<App {...props} />)
        const shouldRecreateRootFolderId = component
          .instance()
          .shouldRecreateRootFolderId(props, {
            authenticated: true,
          })
        expect(shouldRecreateRootFolderId).toBe(false)
      })
    })
    describe('When the user went from un-authenticated to authenticated', () => {
      it('Should be `true`', () => {
        const props = generateProps({
          authenticated: false,
        })
        const component = shallow(<App {...props} />)
        const shouldRecreateRootFolderId = component
          .instance()
          .shouldRecreateRootFolderId(props, {
            authenticated: true,
          })
        expect(shouldRecreateRootFolderId).toBe(true)
      })
    })
  })
})
