import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import * as actions from '../../../actions/authAction'

class Signup extends Component {
  static propTypes () {
    return {
      signupUser: PropTypes.func.isRequired,
      handleSubmit: PropTypes.func.isRequired,
      pristine: PropTypes.bool,
      submitting: PropTypes.bool,
      errorMessage: PropTypes.string
    }
  }

  handleFormSubmit (formProps) {
    this.props.signupUser(formProps)
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
      <div>
        <label>{label}</label>
        <div>
          <input {...input} placeholder={label} type={type} className="form-control" />
          {touched && error && <div className="error">{error}</div>}
        </div>
      </div>
    )
  }

  render () {
    const { handleSubmit, pristine, submitting } = this.props
    return (
      <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
        <Field name="username" label="Username" component={this.renderField} type="text"/>
        <Field name="password" label="Password" component={this.renderField} type="password"/>
        <Field name="passwordConfirm" label="Confirm Password" component={this.renderField} type="password"/>
        <br/>
        {this.renderAlert()}
        <button action="submit" disabled={pristine || submitting} className="btn btn-primary">Sign up!</button>
      </form>
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
  if (!values.passwordConfirm) {
    errors.passwordConfirm = 'Please enter a password confirmation'
  }
  if (values.password !== values.passwordConfirm) {
    errors.password = 'Passwords must match'
  }
  return errors
}

const form = reduxForm({
  form: 'signup',
  validate
})

export default connect(
  state => ({
    errorMessage: state.auth.error
  }), actions
)(form(Signup))
