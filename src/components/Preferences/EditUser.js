import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import FlashMessage from '../FlashMessage'
import Permission from '../../models/Permission'
import UserForm from './UserForm'
import User from '../../models/User'
import { resetUser, updateUser } from '../../actions/usersActions'

class EditUser extends Component {
  static propTypes = {
    authorizedUserId: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.instanceOf(User)),
    user: PropTypes.instanceOf(User),
    onSetActivePane: PropTypes.func.isRequired,
    updateUserError: PropTypes.bool.isRequired,
    updateUserErrorMessage: PropTypes.bool.isRequired,
    isUpdatingUser: PropTypes.bool.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.shape({
      resetUser: PropTypes.func.isRequired,
      updateUser: PropTypes.func.isRequired,
    }),
  }

  state = {
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
            })
          }, 2000)
        },
      )
    }
  }

  hasModifiedUser() {
    const editableFields = [
      'email',
      'firstName',
      'lastName',
      'password',
      'confirmPassword',
    ]

    const unmodifiedUser = this.props.users.find(user => {
      return user.id === this.props.user.id
    })

    if (unmodifiedUser === undefined) {
      return false
    }

    return editableFields.some(field => {
      const modifiedUserField = this.props.user[field]
      const unmodifiedUserField = unmodifiedUser[field]
      return modifiedUserField !== unmodifiedUserField
    })
  }

  onSubmit = event => {
    const { user } = this.props
    const permissionIds = Array.isArray(user.permissions)
      ? user.permissions.map(permission => permission.id)
      : undefined

    this.props.actions.updateUser({
      id: user.id,
      username: user.email,
      oldPassword: user.oldPassword,
      password: user.password,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: permissionIds,
    })
  }

  resetUser = event => {
    event.preventDefault()
    this.props.actions.resetUser()
    this.props.onSetActivePane('user')
  }

  isEditingOwnAccount() {
    return this.props.user.id === this.props.authorizedUserId
  }

  getSubmitState() {
    if (this.state.showSubmitSuccess === true) {
      return 'success'
    }

    if (this.props.isUpdatingUser) {
      return 'loading'
    }
  }

  render() {
    return (
      <div>
        {this.props.updateUserError && (
          <FlashMessage look="error">
            {this.props.updateUserErrorMessage || 'Unable to udpate the user'}
          </FlashMessage>
        )}
        <UserForm
          user={this.props.user}
          heading="Edit User"
          buttonSubmitLabel="Save Edits"
          onSubmit={this.onSubmit}
          submitState={this.getSubmitState()}
          onCancel={this.resetUser}
        />
      </div>
    )
  }
}

export default connect(
  state => ({
    availablePermissions: state.permissions.all,
    user: state.users.user,
    users: state.users.users,
    authorizedUserId: state.auth.user.id,
    updateUserError: state.users.updateUserError,
    updateUserErrorMessage: state.users.updateUserErrorMessage,
    isUpdatingUser: state.users.isUpdatingUser,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        resetUser,
        updateUser,
      },
      dispatch,
    ),
  }),
)(EditUser)
