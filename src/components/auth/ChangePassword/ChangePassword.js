import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class ChangePassword extends Component {
  static propTypes = {
    onChangePassword: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
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
    this.props.onChangePassword(this.state.password)
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
    return (
      <div className="ChangePassword">
        <div className="ChangePassword-header">
          <div className="ChangePassword-settings icon-cog"/>
          <div className="ChangePassword-title">Change Password</div>
          <div className="flexOn"/>
          <div className="ChangePassword-close icon-cross2" onClick={this.cancel}/>
        </div>
        <div className="ChangePassword-body">
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
          <div className="auth-error">{mismatch ? 'Passwords do not match' : ''}</div>
          <div className={classnames('auth-button-primary', {disabled})}
               onClick={!disabled && this.updatePassword}>Update</div>
          <div className="auth-forgot" onClick={this.cancel}>Cancel</div>
        </div>
      </div>
    )
  }
}
