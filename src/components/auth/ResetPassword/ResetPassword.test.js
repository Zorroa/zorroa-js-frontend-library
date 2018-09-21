/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import ResetPassword from './ResetPassword'

jest.mock('../../Logo')
jest.mock('../../Form/ConnectedButton.js')
configure({ adapter: new Adapter() })

function generateActions() {
  const resetPassword = jest.fn()
  return {
    resetPassword,
  }
}

function generateProps(specialProps) {
  return {
    passwordResetStatus: undefined,
    history: {
      goBack: jest.fn(),
      push: jest.fn(),
    },
    location: {
      origin: 'https://localhost',
      search:
        '?token=z1fwj6lmlkpottcqv7vja9ro4r8kiem6z6y18qy8y6txbp2t2a3fjqlyss35w3p5&source=file_server',
    },
    actions: generateActions(),
    ...specialProps,
  }
}

describe('<ResetPassword />', () => {
  describe('isMismatched()', () => {
    describe('When the password has not been set', () => {
      it('Should be `true`', () => {
        const props = generateProps()
        const component = shallow(<ResetPassword {...props} />)
        const isMismatched = component.instance().isMismatched()
        expect(isMismatched).toEqual(false)
      })
    })

    describe('When the password has been set, but both fields are different', () => {
      it('Should be `true`', () => {
        const props = generateProps()
        const component = shallow(<ResetPassword {...props} />)
        component.instance().changePassword({
          target: {
            value: 'Password123',
          },
        })
        component.instance().changePassword2({
          target: {
            value: 'Password12',
          },
        })
        const isMismatched = component.instance().isMismatched()
        expect(isMismatched).toEqual(true)
      })
    })

    describe('When the password has been set, and both fields are the same', () => {
      it('Should be `true`', () => {
        const props = generateProps()
        const component = shallow(<ResetPassword {...props} />)
        component.instance().changePassword({
          target: {
            value: 'LetMeInMaybe',
          },
        })
        component.instance().changePassword2({
          target: {
            value: 'LetMeInMaybe',
          },
        })
        const isMismatched = component.instance().isMismatched()
        expect(isMismatched).toEqual(false)
      })
    })
  })

  describe('getErrorMessage()', () => {
    describe('When the password fails to meet strength requirements', () => {
      it('Should list the requirements that failed from the error message', () => {
        const props = generateProps({
          passwordResetException: 'java.lang.IllegalArgumentException',
          passwordResetErrorMessage: 'Must contain 1 number',
        })
        const component = shallow(<ResetPassword {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toEqual('Must contain 1 number')
      })
    })

    describe('When the token is invalid', () => {
      it('Should explain the token is invalid and how to get a new one', () => {
        const props = generateProps({
          passwordResetErrorCause:
            'org.springframework.security.authentication.AuthenticationCredentialsNotFoundException',
        })
        const component = shallow(<ResetPassword {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toEqual(
          'The token that was submitted is invalid. Try requesting a new token and check your email for the latest password reset message.',
        )
      })
    })

    describe('When there is an error message from the error response', () => {
      it('Should display that erorr message', () => {
        const props = generateProps({
          passwordResetErrorMessage: "We just don't like you today",
        })
        const component = shallow(<ResetPassword {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toEqual("We just don't like you today")
      })
    })

    describe('When there only an error status', () => {
      it('Should display a generic erorr message', () => {
        const props = generateProps({
          passwordResetStatus: 'errored',
        })
        const component = shallow(<ResetPassword {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toEqual(
          'There was a problem resetting the password. Please try again in a few minutes. If the problem continues contact support.',
        )
      })
    })

    describe('When there is no error', () => {
      it('Should return undefined', () => {
        const props = generateProps({})
        const component = shallow(<ResetPassword {...props} />)
        const errorMessage = component.instance().getErrorMessage()
        expect(errorMessage).toEqual(undefined)
      })
    })
  })

  describe('isDisabled()', () => {
    describe('When passwords match, have an accetable strength score and are entered', () => {
      it('Should be false', () => {
        const props = generateProps({})
        const component = shallow(<ResetPassword {...props} />)

        component.instance().changePassword({
          target: {
            value: 'PP@ssword123!',
          },
        })
        component.instance().changePassword2({
          target: {
            value: 'PP@ssword123!',
          },
        })
        const isDisabled = component.instance().isDisabled()
        expect(isDisabled).toEqual(false)
      })
    })
  })

  describe('getPasswordStrength()', () => {
    describe('Should return a percentage of password strength', () => {
      it('Should be false', () => {
        const props = generateProps({})
        const component = shallow(<ResetPassword {...props} />)
        component.instance().changePassword({
          target: {
            value: 'PP@ssword123!',
          },
        })
        const passwordStrength = component.instance().getPasswordStrength()
        expect(passwordStrength).toEqual(25)
      })
    })
  })

  describe('getPasswordStrength()', () => {
    describe('Should return a description of the password strength', () => {
      it('Should be false', () => {
        const props = generateProps({})
        const component = shallow(<ResetPassword {...props} />)
        component.instance().changePassword({
          target: {
            value: 'PP@ssword123!',
          },
        })
        const passwordStrengthDescription = component
          .instance()
          .getPasswordStrengthDescription()
        expect(passwordStrengthDescription).toEqual('Below Average')
      })
    })
  })

  describe('updatePassword()', () => {
    it('Should send a request with the password and a reset token', () => {
      const props = generateProps({})
      const component = shallow(<ResetPassword {...props} />)
      component.instance().changePassword({
        target: {
          value: 'PP@ssword123!',
        },
      })
      component.instance().changePassword2({
        target: {
          value: 'PP@ssword123!',
        },
      })
      component.instance().updatePassword({ preventDefault: jest.fn() })
      const password = props.actions.resetPassword.mock.calls[0][0]
      const token = props.actions.resetPassword.mock.calls[0][1]
      expect(password).toEqual('PP@ssword123!')
      expect(token).toEqual(
        'z1fwj6lmlkpottcqv7vja9ro4r8kiem6z6y18qy8y6txbp2t2a3fjqlyss35w3p5',
      )
    })
  })
})
