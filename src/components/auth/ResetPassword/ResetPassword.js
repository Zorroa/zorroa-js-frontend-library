import PropTypes from 'prop-types'
import React, { Component } from 'react'
import domUtils from '../../../services/domUtils'
import Logo from '../../Logo'
import Heading from '../../Heading'
import FlashMessage from '../../FlashMessage'
import IntensityBar from '../../IntensityBar'
import { FormButton as Button } from '../../Form'

export default class ResetPassword extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      resetPassword: PropTypes.func.isRequired,
    }),
    passwordResetStatus: PropTypes.oneOf(['pending', 'succeeded', 'errored']),
    error: PropTypes.string,
    passwordResetException: PropTypes.string,
    passwordResetErrorMessage: PropTypes.string,
    passwordResetErrorCause: PropTypes.string,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
      origin: PropTypes.string.isRequired,
    }),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
  }

  state = {
    password: '',
    password2: '',
  }

  componentDidUpdate(prevProps) {
    this.checkForSuccessfulReset(prevProps)
  }

  componentWillMount() {
    this.loadZXCVBN()
  }

  loadZXCVBN() {
    import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn')
      .then(({ default: zxcvbn }) => {
        this._zxcvbn = zxcvbn
      })
      .catch(error => {
        console.error('Unable to load ZXCVBN', error)
      })
  }

  checkForSuccessfulReset(prevProps) {
    const didPasswordChange =
      this.props.passwordResetStatus !== prevProps.passwordResetStatus
    const didPasswordChangeSucceed =
      this.props.passwordResetStatus === 'succeeded'
    if (didPasswordChange && didPasswordChangeSucceed) {
      setTimeout(() => {
        this.props.history.push('/')
      }, 5000)
    }
  }

  changePassword = event => {
    this.setState({ password: event.target.value })
  }

  changePassword2 = event => {
    this.setState({ password2: event.target.value })
  }

  updatePassword = event => {
    event.preventDefault()

    if (this.isDisabled()) {
      return
    }

    const token = domUtils.parseQueryString(this.props.location.search).token
    const password = this.state.password
    this.props.actions.resetPassword(password, token)
  }

  cancel = event => {
    this.props.history.push('/signin')
  }

  getErrorMessage() {
    const errorCauses = {
      'org.springframework.security.authentication.AuthenticationCredentialsNotFoundException':
        'The token that was submitted is invalid. Try requesting a new token and check your email for the latest password reset message.',
    }

    if (
      this.props.passwordResetException === 'java.lang.IllegalArgumentException'
    ) {
      // TODO, how can this be re-worked to provide i18n support? We need to receive
      // precise error codes from the backend here. Note thhis also has security
      // implications for only discolosing minimum secure password requirements
      return this.props.passwordResetErrorMessage
    }

    if (errorCauses[this.props.passwordResetErrorCause]) {
      return errorCauses[this.props.passwordResetErrorCause]
    }

    if (this.props.passwordResetErrorMessage) {
      return this.props.passwordResetErrorMessage
    }

    if (this.props.passwordResetStatus === 'errored') {
      return 'There was a problem resetting the password. Please try again in a few minutes. If the problem continues contact support.'
    }
  }

  zxcvbn(password) {
    if (typeof this._zxcvbn === 'function') {
      return this._zxcvbn(password)
    }

    return {
      score: 1,
    }
  }

  isMismatched() {
    const { password, password2 } = this.state
    const isMismatched = password.length > 0 && password !== password2
    return isMismatched
  }

  isDisabled() {
    const { password } = this.state
    const mismatch = this.isMismatched()
    const badPasswordScore = this.getPasswordStrength() === 0
    const disabled = password.length === 0 || mismatch || badPasswordScore
    return disabled
  }

  getPasswordStrength() {
    const strenghScore = this.zxcvbn(this.state.password).score
    const maxScore = 4
    return Math.max(0, Math.min(strenghScore / maxScore * 100, 100))
  }

  getPasswordStrengthDescription() {
    if (this.state.password.length === 0) {
      return ''
    }

    const passwordStrengthDescriptions = [
      'Ineffective',
      'Below Average',
      'Average',
      'Above Average',
      'Strong!',
    ]

    return passwordStrengthDescriptions[this.zxcvbn(this.state.password).score]
  }

  getButtonState() {
    if (this.props.passwordResetStatus === 'pending') {
      return 'loading'
    }

    if (this.props.passwordResetStatus === 'errored') {
      return 'error'
    }

    if (this.props.passwordResetStatus === 'succeeded') {
      return 'success'
    }
  }

  render() {
    const { password, password2 } = this.state
    const disabled = this.isDisabled()
    const error =
      this.getErrorMessage() ||
      (this.isMismatched() ? 'Passwords do not match' : '')
    const passwordStrength = this.getPasswordStrength()
    return (
      <div className="auth">
        <div className="auth-box">
          <div className="ResetPassword">
            <div className="auth-logo">
              <Logo />
            </div>
            <form onSubmit={this.updatePassword} className="auth-form">
              <div className="auth-error">
                {error && (
                  <FlashMessage look="information">{error}</FlashMessage>
                )}
                {this.props.passwordResetStatus === 'succeeded' && (
                  <FlashMessage look="success">
                    Your password has been changed, we’ll log you in shortly.
                  </FlashMessage>
                )}
              </div>
              <div className="auth-help">
                <Heading>Hi, create your new password</Heading>
              </div>
              <div className="auth-field">
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={this.changePassword}
                />
                <label className="auth-label">Password</label>
              </div>
              <div className="auth-field">
                <input
                  className="auth-input"
                  type="password"
                  value={password2}
                  onChange={this.changePassword2}
                />
                <label className="auth-label">Re-enter Password</label>
              </div>
              <div className="ResetPassword__password-metadata">
                <IntensityBar intensityPercent={passwordStrength} />
                <div className="ResetPassword__password-strength">
                  {this.state.password.length > 0
                    ? 'Password Strength: '
                    : 'Password Strength'}
                  <strong>{this.getPasswordStrengthDescription()}</strong>
                </div>
              </div>
              <Button
                state={this.getButtonState()}
                disabled={disabled}
                type="submit">
                Save Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}
