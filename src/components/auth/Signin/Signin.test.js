/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Signin from './Signin'

jest.mock('../../Logo')
jest.mock('../../Form/ConnectedButton.js')
configure({ adapter: new Adapter() })

function generateActions() {
  const clearAuthError = jest.fn()
  const signinUser = jest.fn()
  return {
    clearAuthError,
    signinUser,
  }
}

function generateProps(specialProps) {
  return {
    passwordResetStatus: undefined,
    authenticated: false,
    location: {
      origin: 'https://localhost',
    },
    actions: generateActions(),
    ...specialProps,
  }
}

describe('<Signin />', () => {
  describe('clearError()', () => {
    describe('When clear error is called when there is an error', () => {
      it('Should clear all auth errors', () => {
        const props = generateProps({
          error: 'Could not conenct to server',
        })
        shallow(<Signin {...props} />)
        expect(props.actions.clearAuthError.mock.calls.length).toEqual(1)
      })
    })

    describe('When clear error is called when there is no error', () => {
      it('Should not clear auth errors', () => {
        const props = generateProps({})
        shallow(<Signin {...props} />)
        expect(props.actions.clearAuthError.mock.calls.length).toEqual(0)
      })
    })
  })

  describe('submit()', () => {
    describe('When the form is empty', () => {
      it('Should not attempt to sign in the user', () => {
        const props = generateProps({})
        const component = shallow(<Signin {...props} />)
        component.instance().submit({ preventDefault: jest.fn() })
        const callCount = props.actions.signinUser.mock.calls.length
        expect(callCount).toEqual(0)
      })
    })

    describe('When the form has a username and password', () => {
      it('Should sign in the user', () => {
        const props = generateProps({})
        const component = shallow(<Signin {...props} />)
        component.instance().changeUsername({
          target: {
            value: 'user@zorroa.com',
          },
        })
        component.instance().changePassword({
          target: {
            value: 'Letmein1',
          },
        })
        component.instance().submit({ preventDefault: jest.fn() })
        const username = props.actions.signinUser.mock.calls[0][0]
        const password = props.actions.signinUser.mock.calls[0][1]
        const origin = props.actions.signinUser.mock.calls[0][2]
        expect(username).toEqual('user@zorroa.com')
        expect(password).toEqual('Letmein1')
        expect(origin).toEqual('https://localhost')
      })
    })
  })

  describe('getErrorMessage()', () => {
    describe('When ecountering HTTP status codes 401 or 403', () => {
      it('Should warn that the username or password is wrong', () => {
        const props = generateProps({
          userSigninErrorStatusCode: 401,
        })
        const component = shallow(<Signin {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toBe('The username or password is incorrect.')
      })
    })

    describe('When ecountering an unexpected status code', () => {
      it('Should warn about the unexpected code', () => {
        const props = generateProps({
          userSigninErrorStatusCode: 504,
        })
        const component = shallow(<Signin {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toBe(
          "A problem happened while trying to log in. Please try again in a few minutes. If this error persists please contact support with error code '504'",
        )
      })
    })

    describe('When ecountering a request error with no code', () => {
      it('Should give a generic warning', () => {
        const props = generateProps({
          userSigninErrorStatusCode: undefined,
          userSigninStatus: 'errored',
        })
        const component = shallow(<Signin {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toBe(
          'An unknown error occured. Please try again in a few minutes.',
        )
      })
    })

    describe('When there is no error', () => {
      it('Should give return `undefined`', () => {
        const props = generateProps({})
        const component = shallow(<Signin {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toBe(undefined)
      })
    })
  })
})
