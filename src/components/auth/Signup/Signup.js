import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import * as actions from '../../../actions/authAction'

class Signup extends Component {
  static propTypes () {
    return {
      signupUser: PropTypes.func.isRequired,
      handleSubmit: PropTypes.func.isRequired,
      pristine: PropTypes.boolean,
      submitting: PropTypes.boolean,
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

  render () {
    const { handleSubmit, pristine, submitting } = this.props
    return (
      <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
        <label>Email:</label>
        <div>
          <Field name="email" component="input" type="text" className="form-control"/>
        </div>
        <label>Password:</label>
        <div>
          <Field name="password" component="input" type="password" className="form-control"/>
        </div>
        <label>Confirm Password:</label>
        <div>
          <Field name="passwordConfirm" component="input" type="password" className="form-control"/>
        </div>
        <br/>
        {this.renderAlert()}
        <button action="submit" disabled={pristine || submitting} className="btn btn-primary">Sign up!</button>
      </form>
    )
  }
}

function validate (formProps) {
  const errors = {}
  if (!formProps.email) {
    errors.email = 'Please enter an email'
  }
  if (!formProps.password) {
    errors.password = 'Please enter a password'
  }
  if (!formProps.passwordConfirm) {
    errors.passwordConfirm = 'Please enter a password confirmation'
  }
  if (formProps.password !== formProps.passwordConfirm) {
    errors.password = 'Passwords must match'
  }
  return errors
}

function mapStateToProps (state) {
  return { errorMessage: state.auth.error }
}

const form = reduxForm({
  form: 'signup',
  validate
})

export default connect(mapStateToProps, actions)(form(Signup))
