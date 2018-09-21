import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { FormButton as Button } from '../../Form'

import Logo from '../../Logo'
import FlashMessage from '../../FlashMessage'

const ERROR_UNAUTHORIZED = 401
const ERROR_FORBIDDEN = 403

export default class Signin extends Component {
  static propTypes = {
    error: PropTypes.string,
    defaults: PropTypes.object,
    actions: PropTypes.shape({
      clearAuthError: PropTypes.func.isRequired,
      signinUser: PropTypes.func.isRequired,
    }).isRequired,
    authenticated: PropTypes.bool,
    location: PropTypes.shape({
      origin: PropTypes.string.isRequired,
      state: PropTypes.string,
    }).isRequired,
    userSigninStatus: PropTypes.string,
    userSigninErrorStatusCode: PropTypes.number,
  }

  state = {
    username: '',
    password: '',
  }

  componentWillMount() {
    if (this.props.defaults) {
      const username = this.props.defaults.username
      this.setState({ username })
    }
    this.clearError()
  }

  clearError = () => {
    if (this.props.error) {
      this.props.actions.clearAuthError()
    }
  }

  changeUsername = event => {
    this.setState({ username: event.target.value })
    this.clearError()
  }

  changePassword = event => {
    this.setState({ password: event.target.value })
    this.clearError()
  }

  submit = event => {
    event.preventDefault()
    if (this.isDisabled()) {
      return
    }

    const { username, password } = this.state
    const origin = this.props.location.origin
    this.props.actions.signinUser(username, password, origin)
  }

  getErrorMessage() {
    const { userSigninErrorStatusCode } = this.props
    if (
      userSigninErrorStatusCode === ERROR_UNAUTHORIZED ||
      userSigninErrorStatusCode === ERROR_FORBIDDEN
    ) {
      return 'The username or password is incorrect.'
    }

    if (userSigninErrorStatusCode !== undefined) {
      return `A problem happened while trying to log in. Please try again in a few minutes. If this error persists please contact support with error code '${userSigninErrorStatusCode}'`
    }

    if (this.props.userSigninStatus === 'errored') {
      return 'An unknown error occured. Please try again in a few minutes.'
    }
  }

  isDisabled() {
    const { username, password } = this.state
    return !username || !username.length || !password || !password.length
  }

  getButtonState() {
    if (this.props.userSigninStatus === 'pending') {
      return 'loading'
    }
  }

  render() {
    const { username, password } = this.state
    const disabled = this.isDisabled()
    const { from } = this.props.location.state || { from: { pathname: '/' } }

    if (this.props.authenticated) {
      return <Redirect to={from} />
    }

    return (
      <div className="auth">
        <div className="auth-box">
          <div className="auth-logo">
            <Logo />
          </div>
          <form onSubmit={this.submit} className="auth-form">
            <div className="auth-error">
              {this.props.userSigninStatus === 'errored' && (
                <FlashMessage look="information">
                  {this.getErrorMessage()}
                </FlashMessage>
              )}
            </div>
            <div className="auth-field">
              <input
                className="auth-input"
                type="text"
                value={username}
                name="username"
                onChange={this.changeUsername}
              />
              <label className="auth-label">Username</label>
            </div>
            <div className="auth-field">
              <input
                className="auth-input"
                type="password"
                value={password}
                name="password"
                onChange={this.changePassword}
              />
              <label className="auth-label">Password</label>
            </div>
            <Button
              state={this.getButtonState()}
              type="submit"
              disabled={disabled}>
              Login
            </Button>
          </form>
          <Link className="auth-forgot" to="/forgot">
            Forgot Password?
          </Link>
        </div>
      </div>
    )
  }
}
