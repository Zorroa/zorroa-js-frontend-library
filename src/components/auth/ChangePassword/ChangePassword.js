import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { updatePassword } from '../../../actions/authAction'

import Logo from '../../Logo'

class ChangePassword extends Component {
  static propTypes = {
    onCancel: PropTypes.func
  }

  state = {
    password: '',
    password2: ''
  }

  changePassword = (event) => {
    this.setState({password: event.target.value})
  }

  changePassword2 = (event) => {
    this.setState({password2: event.target.value})
  }

  updatePassword = (event) => {
    this.props.actions.updatePassword(this.state.password)
  }

  cancel = (event) => {
    this.props.onCancel()
  }

  submit = (event) => {
    if (event.key === 'Enter') this.updatePassword()
  }

  render () {
    const { password, password2 } = this.state
    const mismatch = password.length && password !== password2
    const disabled = !password.length || mismatch
    const fullscreen = !this.props.onCancel
    return (
      <div className={classnames('ChangePassword', {fullscreen})}>
        { !fullscreen && (
          <div className="ChangePassword-header">
            <div className="ChangePassword-settings icon-cog"/>
            <div className="ChangePassword-title">Change Password</div>
            <div className="flexOn"/>
            <div className="ChangePassword-close icon-cross2" onClick={this.cancel}/>
          </div>
        )}
        <div className="ChangePassword-body">
          { fullscreen && (
            <div className="auth-logo">
              <Logo/>
            </div>
          )}
          <div className="auth-form">
            <div className="auth-error">{mismatch ? 'Passwords do not match' : ''}</div>
            <div className="auth-field">
              <input className="auth-input" type="password" value={password}
                     onChange={this.changePassword} onKeyDown={!disabled && this.submit}/>
              <label className="auth-label">Password</label>
            </div>
            <div className="auth-field">
              <input className="auth-input" type="password" value={password2}
                     onChange={this.changePassword2} onKeyDown={!disabled && this.submit}/>
              <label className="auth-label">Re-enter Password</label>
            </div>
            <div className={classnames('auth-button-primary', {disabled})}
                 onClick={!disabled && this.updatePassword}>Update</div>
            { !fullscreen && <div className="auth-forgot" onClick={this.cancel}>Cancel</div> }
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
    updatePassword
  }, dispatch)
}))(ChangePassword)
