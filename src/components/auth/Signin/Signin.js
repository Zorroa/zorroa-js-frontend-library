import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'

import Logo from '../../../components/Logo'
import * as actions from '../../../actions/authAction'

class Signin extends Component {
  static get propTypes () {
    return {
      signinUser: PropTypes.func.isRequired,
      handleSubmit: PropTypes.func.isRequired,
      pristine: PropTypes.bool,
      submitting: PropTypes.bool,
      errorMessage: PropTypes.object
    }
  }

  handleFormSubmit ({ username, password, host }) {
    this.props.signinUser({ username, password, host })
  }

  renderAlert () {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          <strong>Oops!</strong> {this.props.errorMessage}
        </div>
      )
    }
  }

  renderField ({ input, label, type, meta: { touched, error } }) {
    return (
      <div className="auth-field">
        <input {...input} type={type} className="auth-input" />
        <label className="auth-label">{label}</label>
        {touched && error && <div className="error">{error}</div>}
      </div>
    )
  }

  render () {
    const { handleSubmit, pristine, submitting } = this.props

    return (
      <div className="auth">
        <div className="auth-box">
          <div className="auth-logo">
            <Logo/>
          </div>
          <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))} className="auth-form">
            <Field name="username" label="USERNAME" component={this.renderField} type="text" />
            <Field name="password" label="PASSWORD" component={this.renderField} type="password"/>
            <Field name="host" label="HOST" component={this.renderField} type="text" />
            {this.renderAlert()}
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
    errors.username = 'Please enter an username'
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
    initialValues: { host: state.auth.host, username: state.auth.user ? state.auth.user.username : null },
    errorMessage: state.auth.error
  }), actions
)(form(Signin))
