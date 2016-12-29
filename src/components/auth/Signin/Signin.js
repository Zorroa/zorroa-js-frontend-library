import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'

import Logo from '../../../components/Logo'
import * as actions from '../../../actions/authAction'

class Signin extends Component {
  static propTypes = {
    signinUser: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    errorMessage: PropTypes.string
  }

  handleFormSubmit ({ username, password, ssl, host }) {
    const protocol = ssl ? 'https:' : 'http:'
    this.props.signinUser({ username, password, protocol, host })
  }

  renderAlert () {
    let msg = ''
    if (this.props.errorMessage) {
      console.log(this.props.errorMessage)
      msg = (<div className="auth-error-msg">The username and/or password don&rsquo;t match. Please try again or use the <Link className="" to="/signup">forgot password</Link> link.</div>)
    }
    return (<span className="auth-error">{msg}</span>)
  }

  renderField ({ input, label, type, meta: { touched, error } }) {
    let msg = touched && error ? error : (<span>&nbsp;</span>)
    let inputClass = `auth-input auth-${type}`
    return (
      <div className="auth-field">
        <input {...input} type={type} className={inputClass} />
        <label className="auth-label">{label}</label>
        <div className="auth-validation-error">{msg}</div>
      </div>
    )
  }

  render () {
    const { handleSubmit, pristine, submitting } = this.props

    return (
      <div className="auth flexCenter">
        <div className="auth-box flexColCenter">
          <div className="auth-logo flexCenter">
            <Logo/>
          </div>
          <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))} className="auth-form flexColCenter flexJustifySpaceBetween">
            {this.renderAlert()}
            <Field name="username" label="Username" component={this.renderField} type="text" />
            <Field name="password" label="Password" component={this.renderField} type="password"/>
            { !PROD && <Field name="host" label="Host" component={this.renderField} type="text" /> }
            { !PROD && <div className="auth-field"><Field name="ssl" label="SSL" component="input" type="checkbox" /><label className="auth-label">Use SSL (HTTPS) for HOST</label></div>}
            <button action="submit" disabled={pristine || submitting} className="auth-button-primary">LOGIN</button>
          </form>
          <Link className="auth-forgot" to="/signup">Forgot Password?</Link>
        </div>
      </div>
    )
  }
}

const validate = values => {
  const errors = {}
  if (!values.username) {
    errors.username = 'Please enter a username'
  }
  if (!values.password) {
    errors.password = 'Please enter a password'
  }
  if (!values.host) {
    errors.host = 'Please enter a hostname'
  }
  return errors
}

const form = reduxForm({
  form: 'signin',
  validate
})

export default connect(
  state => ({
    errorMessage: state.auth.error
  }), actions
)(form(Signin))
