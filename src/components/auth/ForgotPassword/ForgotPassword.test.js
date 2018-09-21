/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import ForgotPassword from './ForgotPassword'
import renderer from 'react-test-renderer'
jest.mock('../../Logo')
configure({ adapter: new Adapter() })

function generateActions() {
  const forgotPassword = jest.fn()
  const authError = jest.fn()
  return {
    forgotPassword,
    authError,
  }
}

function generateProps(specialProps) {
  return {
    passwordResetStatus: '',
    history: {
      goBack: jest.fn(),
      push: jest.fn(),
    },
    actions: generateActions(),
    ...specialProps,
  }
}

describe('<ForgotPassword />', () => {
  describe('changeEmail()', () => {
    it('Should update the email', () => {
      const props = generateProps()
      const component = shallow(<ForgotPassword {...props} />)
      component.instance().changeEmail({
        target: {
          value: 'abc@zorroa.ai',
        },
      })
      expect(component.state('email')).toEqual('abc@zorroa.ai')
    })
  })

  describe('When the reset request has not been sent', () => {
    it('Should render the form', () => {
      const props = generateProps()
      const tree = renderer.create(<ForgotPassword {...props} />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('When the reset request is submitted sucesfully', () => {
    it('Should render a success message', () => {
      const props = generateProps()
      const tree = renderer.create(<ForgotPassword {...props} />)

      tree.getInstance().setState({
        showSuccessMessage: true,
      })

      expect(tree.toJSON()).toMatchSnapshot()
    })
  })

  describe('When there is a server error', () => {
    it('Should display a friendly error message', () => {
      const props = generateProps({
        passwordResetStatus: 'errored',
      })
      const tree = renderer.create(<ForgotPassword {...props} />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
