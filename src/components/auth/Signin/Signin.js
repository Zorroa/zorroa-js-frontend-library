import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classnames from 'classnames'

import Logo from '../../Logo'
import { signinUser, authError } from '../../../actions/authAction'

class Signin extends Component {
  static propTypes = {
    error: PropTypes.string,
    defaults: PropTypes.object,
    actions: PropTypes.object
  }

  state = {
    errTime: 0,
    username: '',
    password: '',
    host: '',
    ssl: false
  }

  componentWillMount () {
    if (this.props.defaults) {
      this.setState({...this.props.defaults})
    }
    this.clearError()
  }

  clearError = () => {
    this.props.actions.authError()
  }

  signin = (event) => {
    const { username, password, ssl, host } = this.state
    const protocol = ssl ? 'https:' : 'http:'
    this.props.actions.signinUser(username, password, protocol, host)
    this.forceUpdate()
  }

  changeUsername = (event) => {
    this.setState({username: event.target.value})
    this.clearError()
  }

  changePassword = (event) => {
    this.setState({password: event.target.value})
    this.clearError()
  }

  changeHost = (event) => {
    const bareHost = event.target.value
    // strip the protocol & port if this is copy/pasted
    const host = bareHost.replace(/http.?:\/\//, '').replace(/:[0-9]{2,4}.*/, '')
    this.setState({host})
    this.clearError()
  }

  changeSSL = (event) => {
    this.setState({ ssl: !this.state.ssl })
    this.clearError()
  }

  submit = (event) => {
    if (event.key === 'Enter') {
      this.signin()
    }
  }

  renderAlert () {
    const { error } = this.props
    let changed = false
    let msg = ''
    if (error) {
      if (Date.now() - this.state.errTime > 300) {
        changed = true
        setTimeout(() => { this.setState({ errTime: Date.now() }) }, 0)
      }
      console.log(error)
      msg = (<div className="auth-error-msg">The username and/or password don&rsquo;t match. Please try again or use the <Link className="" to="/forgot">forgot password</Link> link.</div>)
    }
    return (<div className={classnames('auth-error', {changed})}>{msg}</div>)
  }

  render () {
    const { username, password, host, ssl } = this.state
    const disabled = !username || !username.length || (!PROD && (!host || !host.length))
    return (
      <div className="auth">
        <div className="auth-box">
          <div className="auth-logo">
            <Logo/>
          </div>
          <div className="auth-form">
            { this.renderAlert() }
            <div className="auth-field">
              <input className="auth-input" type="text" value={username} name="username"
                     onChange={this.changeUsername} onKeyDown={!disabled && this.submit}/>
              <label className="auth-label">Username</label>
            </div>
            <div className="auth-field">
              <input className="auth-input" type="password" value={password} name="password"
                     onChange={this.changePassword} onKeyDown={!disabled && this.submit}/>
              <label className="auth-label">Password</label>
            </div>
            { !PROD && (
              <div className="auth-host">
                <div className="auth-field">
                  <input className="auth-input flexOn" type="text" value={host} name="host"
                         onChange={this.changeHost} onKeyDown={!disabled && this.submit}/>
                  <label className="auth-label">Archivist</label>
                </div>
                <div className="flexRowCenter">
                  <input type="checkbox" checked={ssl} onChange={this.changeSSL} name="ssl"/>
                  <label className="auth-label">SSL</label>
                </div>
              </div>
            )}
            <div className={classnames('auth-button-primary', {disabled})} onClick={!disabled && this.signin}>Login</div>
          </div>
          <Link className="auth-forgot" to="/forgot">Forgot Password?</Link>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  error: state.auth.error,
  defaults: state.auth.defaults
}), dispatch => ({
  actions: bindActionCreators({
    signinUser,
    authError
  }, dispatch)
}))(Signin)
