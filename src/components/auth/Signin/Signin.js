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
    ssl: false,
    acceptEULA: false
  }

  componentWillMount () {
    if (this.props.defaults) {
      const username = this.props.defaults.username
      let url
      try {
        url = url && new URL(this.props.defaults.origin)
      } catch (e) {
        console.error('Invalid default URL: ' + this.props.defaults.origin) + ': ' + e
      }
      const host = url && url.host || ''
      const isLocalhost = host && host.includes('localhost')
      const ssl = !isLocalhost        // Development settings
      const acceptEULA = isLocalhost
      this.setState({ username, host, ssl, acceptEULA })
    }
    this.clearError()
  }

  clearError = () => {
    this.props.actions.authError()
  }

  signin = (event) => {
    const { username, password, ssl, host } = this.state
    const protocol = ssl ? 'https:' : 'http:'
    const origin = protocol && host && protocol + '//' + host
    this.props.actions.signinUser(username, password, origin)
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
    const host = event.target.value
    const isLocalhost = host && host.includes('localhost')
    const ssl = this.state.ssl && isLocalhost ? false : this.state.ssl
    this.setState({host, ssl})
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

  toggleEULA = (event) => {
    this.setState({ acceptEULA: !this.state.acceptEULA })
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
      msg = (<div className="auth-error-msg">{error}. Please try again or use the <Link className="" to="/forgot">forgot password</Link> link.</div>)
    }
    return (<div className={classnames('auth-error', {changed})}>{msg}</div>)
  }

  render () {
    const { username, password, host, ssl, acceptEULA } = this.state
    const disabled = !username || !username.length || (!PROD && (!host || !host.length)) || !acceptEULA
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
            <div className="auth-eula">
              <input type="checkbox" className="auth-eula-input" name="eula" checked={acceptEULA} onChange={this.toggleEULA}/>
              <div className="auth-eula-label">I accept the Zorroa <a href="http://zorroa.com/eula">terms of use</a></div>
            </div>
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
