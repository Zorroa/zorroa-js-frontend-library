import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Logo from '../../Logo'
import Heading from '../../Heading'
import Paragraph from '../../Paragraph'
import FlashMessage from '../../FlashMessage'
import Button from '../../Form/Button'
import User from '../../../models/User'
import { isValidEmail } from '../../../services/jsUtil'

export default class ForgotPassword extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    actions: PropTypes.shape({
      forgotPassword: PropTypes.func.isRequired,
      authError: PropTypes.func.isRequired,
    }),
    passwordResetStatus: PropTypes.string.isRequired,
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }),
  }

  state = {
    email: '',
    showSuccessMessage: false,
  }

  static get contextTypes() {
    return {
      router: PropTypes.object,
    }
  }

  componentWillMount() {
    this.props.actions.authError() // clear any existing errors
  }

  componentDidUpdate(prevProps) {
    if (this.shouldUpdateSuccessStatus(prevProps)) {
      this.updateResetStatusState()
    }
  }

  shouldUpdateSuccessStatus({ passwordResetStatus }) {
    return passwordResetStatus !== this.props.passwordResetStatus
  }

  updateResetStatusState() {
    this.setState({
      showSuccessMessage: this.props.passwordResetStatus === 'succeeded',
    })
  }

  changeEmail = event => {
    this.setState({ email: event.target.value })
  }

  cancel = event => {
    this.props.history.goBack()
  }

  submit = event => {
    event.preventDefault()
    this.props.actions.forgotPassword(this.state.email)
  }

  login = event => {
    event.preventDefault()
    this.props.history.push('/signin')
  }

  render() {
    const { passwordResetStatus } = this.props
    const { email, showSuccessMessage } = this.state
    const disabled = !email || !email.length || !isValidEmail(email)

    return (
      <div className="auth">
        <div className="auth-box">
          <div className="auth-logo">
            <Logo />
          </div>
          <div className="auth-form">
            {showSuccessMessage === true && (
              <div className="auth-confirm">
                <Heading>Thank you.</Heading>
                <Paragraph>
                  If that email address matches an exisiting account you will
                  recieve a password reset link.
                </Paragraph>
                <div className="auth-button-group">
                  <Button onClick={this.login}>Login</Button>
                </div>
              </div>
            )}
            {showSuccessMessage === false && (
              <form onSubmit={!disabled && this.submit}>
                <div className="auth-error">
                  {passwordResetStatus === 'errored' && (
                    <FlashMessage look="information">
                      There was a problem sending the request. Please try again
                      in a few minutes.
                    </FlashMessage>
                  )}
                </div>
                <div className="auth-help">
                  <Heading>Let’s get your account back</Heading>
                  <Paragraph>
                    Enter your email address and we’ll send you a link to reset
                    your password.
                  </Paragraph>
                </div>
                <div className="auth-field">
                  <input
                    className="auth-input"
                    type="text"
                    value={email}
                    onChange={this.changeEmail}
                  />
                  <label className="auth-label">Email Address</label>
                </div>
                <div className="auth-button-group">
                  <Button
                    type="submit"
                    state={
                      passwordResetStatus === 'pending' ? 'loading' : undefined
                    }
                    disabled={disabled}>
                    Send Password Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }
}
