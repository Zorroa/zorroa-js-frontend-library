import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import classnames from 'classnames'

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

  state = {
    errTime: 0,
    submitTime: 0
  }

  handleFormSubmit ({ username, password, ssl, host }) {
    const protocol = ssl ? 'https:' : 'http:'
    // strip the protocol & port if this is copy/pasted
    let bareHost
    if (host) bareHost = host.replace(/http.?:\/\//, '').replace(/:8066.*/, '')
    this.props.signinUser({ username, password, protocol, host: bareHost })
    // this is only to force a re-render
    this.setState({submitTime: Date.now()})
  }

  renderAlert () {
    let changed = false
    let msg = ''
    if (this.props.errorMessage) {
      if (Date.now() - this.state.errTime > 300) {
        changed = true
        setTimeout(() => { this.setState({ errTime: Date.now() }) }, 0)
      }
      console.log(this.props.errorMessage)
      msg = (<div className="auth-error-msg">The username and/or password don&rsquo;t match. Please try again or use the <Link className="" to="/signup">forgot password</Link> link.</div>)
    }
    return (<div className={classnames('auth-error', {changed})}>{msg}</div>)
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
