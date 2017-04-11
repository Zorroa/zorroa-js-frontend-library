import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Logo from '../../Logo'
import User from '../../../models/User'
import { isValidEmail } from '../../../services/jsUtil'
import { forgotPassword } from '../../../actions/authAction'

class ForgotPassword extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object
  }

  state = {
    email: ''
  }

  static get contextTypes () {
    return {
      router: PropTypes.object
    }
  }

  changeEmail = (event) => {
    this.setState({email: event.target.value})
  }

  update = (event) => {
    this.props.actions.forgotPassword(this.state.email)
  }

  cancel = (event) => {
    this.context.router.push('/')
  }

  submit = (event) => {
    if (event.key === 'Enter') this.update()
  }

  render () {
    const { user } = this.props
    const { email } = this.state
    const disabled = !email || !email.length || !isValidEmail(email)
    return (
      <div className="auth">
        <div className="auth-box">
          <div className="auth-logo">
            <Logo/>
          </div>
          <div className="auth-form">
            <div className="auth-field">
              <div className="auth-forgot-label">Enter your email below to reset your password:</div>
              <input className="auth-input" type="text" value={email}
                     onChange={this.changeEmail} onKeyDown={!disabled && this.submit}/>
              <label className="auth-label">Email</label>
            </div>
            <div className={classnames('auth-button-primary', {disabled})} onClick={!disabled && this.update}>Send Email</div>
            { !user && <div className="auth-forgot" onClick={this.cancel}>Cancel</div> }
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({ forgotPassword }, dispatch)
}))(ForgotPassword)
