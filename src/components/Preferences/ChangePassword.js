import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { updateUser } from '../../actions/usersActions'

import FlashMessage from '../FlashMessage'
import { FormButton as Button } from '../Form'
import Password from './Password'
import Heading from '../Heading'

class ChangePassword extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      updateUser: PropTypes.func.isRequired,
    }),
    userId: PropTypes.number.isRequired,
    updateUserError: PropTypes.bool.isRequired,
    updateUserErrorMessage: PropTypes.string,
    isUpdatingUser: PropTypes.bool.isRequired,
  }

  state = {
    oldPassword: '',
    password: '',
    confirmPassword: '',
    showSubmitSuccess: false,
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isUpdatingUser === false &&
      this.props.isUpdatingUser === true &&
      nextProps.updateUserError === false
    ) {
      this.setState(
        {
          showSubmitSuccess: true,
        },
        () => {
          setTimeout(() => {
            this.setState({
              showSubmitSuccess: false,
              oldPassword: '',
              password: '',
              confirmPassword: '',
            })
          }, 2000)
        },
      )
    }
  }

  onChange = changedPassword => {
    this.setState(changedPassword)
  }

  onSubmit = event => {
    event.preventDefault()
    const { userId } = this.props

    this.props.actions.updateUser({
      id: userId,
      oldPassword: this.state.oldPassword,
      password: this.state.password,
    })
  }

  getSubmitState() {
    if (this.state.showSubmitSuccess === true) {
      return 'success'
    }

    if (this.props.isUpdatingUser) {
      return 'loading'
    }
  }

  isFormComplete() {
    const hasOldPassword =
      this.state.oldPassword && this.state.oldPassword.length > 0
    const hasPassword = this.state.password && this.state.password.length > 0
    const hasConfirmPassword =
      this.state.confirmPassword && this.state.confirmPassword.length > 0

    return hasOldPassword && hasPassword && hasConfirmPassword
  }

  render() {
    const { password, confirmPassword, oldPassword } = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <Heading size="large" level="h2">
          Change Password
        </Heading>
        {this.props.updateUserError && (
          <FlashMessage look="error">
            {this.props.updateUserErrorMessage ||
              'Unable to udpate the password'}
          </FlashMessage>
        )}
        <Password
          oldPassword={oldPassword}
          password={password}
          confirmPassword={confirmPassword}
          requireOriginalPassword
          onChange={this.onChange}
        />
        <Button
          disabled={this.isFormComplete() === false}
          state={this.getSubmitState()}
          type="submit">
          Update Password
        </Button>
      </form>
    )
  }
}

export default connect(
  state => ({
    userId: state.auth.user.id,
    updateUserError: state.users.updateUserError,
    updateUserErrorMessage: state.users.updateUserErrorMessage,
    isUpdatingUser: state.users.isUpdatingUser,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        updateUser,
      },
      dispatch,
    ),
  }),
)(ChangePassword)
