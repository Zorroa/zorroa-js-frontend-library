import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import './UserAdministrator.scss'
import FlashMessage from '../FlashMessage'
import UserTable from './UserTable'
import Heading from '../Heading'
import ListEditor from '../ListEditor'
import { FormInput, FormLabel, FormSelect, FormButton as Button } from '../Form'
import Permission from '../../models/Permission'

import {
  disableUser,
  createUser,
  buildUser,
  resetUser,
  updateUser,
} from '../../actions/usersActions'

const userShape = PropTypes.shape({
  id: PropTypes.string,
  email: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  password: PropTypes.string,
  confirmPassword: PropTypes.string,
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      fullName: PropTypes.string.isRequired,
    }),
  ),
})

class UserAdministrator extends Component {
  static propTypes = {
    authorizedUserId: PropTypes.number.isRequired,
    loadUsersError: PropTypes.bool.isRequired,
    createUserError: PropTypes.bool.isRequired,
    createUserErrorMessage: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(userShape),
    user: userShape,
    updateUserError: PropTypes.bool.isRequired,
    updateUserErrorMessage: PropTypes.bool.isRequired,
    isUpdatingUser: PropTypes.bool.isRequired,
    isCreatingUser: PropTypes.bool.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.shape({
      disableUser: PropTypes.func.isRequired,
      createUser: PropTypes.func.isRequired,
      buildUser: PropTypes.func.isRequired,
      resetUser: PropTypes.func.isRequired,
      updateUser: PropTypes.func.isRequired,
    }),
  }

  state = {
    showSubmitSuccess: false,
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.isUpdatingUser === false &&
        this.props.isUpdatingUser === true &&
        nextProps.updateUserError === false) ||
      (nextProps.isCreatingUser === false &&
        this.props.isCreatingUser === true &&
        nextProps.createUserError === false)
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

  buildEditableUser = editedUser => {
    this.props.actions.buildUser(editedUser)
  }

  isCreatingNewUser() {
    return this.props.user.id === undefined
  }

  hasModifiedUser() {
    const editableFields = [
      'email',
      'firstName',
      'lastName',
      'password',
      'confirmPassword',
    ]

    if (this.isCreatingNewUser() === true) {
      return editableFields.some(field => {
        const userField = this.props.user[field]
        return userField !== undefined && userField !== ''
      })
    } else {
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
  }

  isPasswordValid() {
    const { user } = this.props
    const mustCreateNewPassword = this.isCreatingNewUser()
    const isPasswordEntered =
      user.password !== undefined && user.confirmPassword !== undefined
    const doPasswordsMatch = user.password === user.confirmPassword
    const mustEnterOldPassword =
      this.isEditingOwnAccount() && user.oldPassword === undefined

    if (mustCreateNewPassword === false && isPasswordEntered === false) {
      return true
    }

    const isPasswordChangeValid =
      (mustCreateNewPassword === true &&
        isPasswordEntered === true &&
        doPasswordsMatch === true) ||
      (isPasswordEntered === true &&
        doPasswordsMatch === true &&
        mustEnterOldPassword === false)

    return isPasswordChangeValid
  }

  onSubmit = event => {
    const { user } = this.props
    const isPasswordChangeInvalid = !this.isPasswordValid()
    const canSubmitForm = isPasswordChangeInvalid === false
    const permissionIds = Array.isArray(user.permissions)
      ? user.permissions.map(permission => permission.id)
      : undefined

    event.preventDefault()

    if (canSubmitForm === false) {
      return
    }

    if (this.isCreatingNewUser()) {
      this.props.actions.createUser({
        username: user.email,
        password: user.password,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        permissionIds,
      })
    } else {
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
  }

  hasNetworkErrors() {
    return (
      this.props.loadUsersError === true ||
      this.props.createUserError === true ||
      this.props.updateUserError === true
    )
  }

  resetUser = event => {
    event.preventDefault()
    const warningMessage =
      'You have unsaved changes. Are you sure you want to discard them?'

    if (this.hasModifiedUser() && window.confirm(warningMessage) === false) {
      return
    }

    this.props.actions.resetUser()
  }

  onPermissionDelete = permission => {
    if (this.props.user.permissions === undefined) {
      return
    }

    const permissions = this.props.user.permissions.filter(
      assignedPermission => {
        return permission.fullName !== assignedPermission.fullName
      },
    )

    this.props.actions.buildUser({
      permissions,
    })
  }

  isEditingOwnAccount() {
    return this.props.user.id === this.props.authorizedUserId
  }

  onPermissionSelected = permission => {
    const permissions = this.props.user.permissions || []
    permissions.push(permission)
    this.props.actions.buildUser({
      permissions,
    })
  }

  getUnassignedPermissions() {
    const assignedPermissions = this.props.user.permissions
    const availablePermissions = this.props.availablePermissions
    const hasNoAssignedPermissions =
      assignedPermissions === undefined || assignedPermissions.length === 0

    if (hasNoAssignedPermissions) {
      return availablePermissions
    }

    return availablePermissions.filter(permission => {
      return (
        assignedPermissions.find(assignedPermission => {
          return assignedPermission.fullName === permission.fullName
        }) === undefined
      )
    })
  }

  getSubmitState() {
    if (this.state.showSubmitSuccess === true) {
      return 'success'
    }

    if (this.props.isCreatingUser === true || this.props.isUpdatingUser) {
      return 'loading'
    }
  }

  render() {
    const { user } = this.props
    const isPasswordChangeInvalid =
      this.isPasswordValid() === false && user.confirmPassword !== undefined

    return (
      <div className="UserAdministrator">
        {this.hasNetworkErrors() && (
          <div className="UserAdministrator__errors">
            {this.props.loadUsersError && (
              <FlashMessage look="error">
                Unable to load the users list. Please close this window and try
                again
              </FlashMessage>
            )}
            {this.props.createUserError && (
              <FlashMessage look="error">
                {this.props.createUserErrorMessage}
              </FlashMessage>
            )}
            {this.props.updateUserError && (
              <FlashMessage look="error">
                {this.props.updateUserErrorMessage ||
                  'Unable to udpate the user'}
              </FlashMessage>
            )}
          </div>
        )}
        <form className="UserAdministrator__form" onSubmit={this.onSubmit}>
          <Heading size="large" level="h2">
            {this.isCreatingNewUser() ? 'Create User' : 'Edit User'}
          </Heading>
          <div className="UserAdministrator__fields">
            <fieldset className="UserAdministrator__field-group">
              <FormLabel
                vertical
                label="Email (used For username)"
                className="UserAdministrator__form-element">
                <FormInput
                  required
                  value={user.email}
                  type="email"
                  onChange={email => {
                    this.buildEditableUser({ email })
                  }}
                />
              </FormLabel>
              <FormLabel
                vertical
                label="First Name"
                className="UserAdministrator__form-element">
                <FormInput
                  required
                  value={user.firstName}
                  onChange={firstName => {
                    this.buildEditableUser({ firstName })
                  }}
                />
              </FormLabel>
              <FormLabel
                vertical
                label="Last Name"
                className="UserAdministrator__form-element">
                <FormInput
                  required
                  value={user.lastName}
                  onChange={lastName => {
                    this.buildEditableUser({ lastName })
                  }}
                />
              </FormLabel>
            </fieldset>
            <fieldset className="UserAdministrator__field-group">
              {this.isEditingOwnAccount() && (
                <FormLabel
                  vertical
                  error={isPasswordChangeInvalid}
                  label="Original Password"
                  className="UserAdministrator__form-element">
                  <FormInput
                    onChange={password => {
                      this.buildEditableUser({ oldPassword: password })
                    }}
                    value={user.oldPassword}
                    error={isPasswordChangeInvalid}
                    type="password"
                  />
                </FormLabel>
              )}
              <FormLabel
                vertical
                error={isPasswordChangeInvalid}
                label="Password"
                className="UserAdministrator__form-element">
                <FormInput
                  onChange={password => {
                    this.buildEditableUser({ password })
                  }}
                  value={user.password}
                  error={isPasswordChangeInvalid}
                  type="password"
                />
              </FormLabel>
              <FormLabel
                vertical
                error={isPasswordChangeInvalid}
                label="Confirm Password"
                className="UserAdministrator__form-element">
                <FormInput
                  onChange={confirmPassword => {
                    this.buildEditableUser({ confirmPassword })
                  }}
                  value={user.confirmPassword}
                  error={isPasswordChangeInvalid}
                  type="password"
                />
                {isPasswordChangeInvalid && (
                  <span>
                    {this.isEditingOwnAccount() === false &&
                      'Passwords don’t match'}
                    {this.isEditingOwnAccount() === true &&
                      'Passwords don’t match or you must enter your old password'}
                  </span>
                )}
              </FormLabel>
            </fieldset>
            <fieldset className="UserAdministrator__field-group UserAdministrator__field-group--permissions">
              <FormLabel
                vertical
                label="Permissions"
                className="UserAdministrator__form-element">
                {Array.isArray(user.permissions) &&
                  user.permissions.length > 0 && (
                    <ListEditor
                      onClick={this.onPermissionDelete}
                      items={user.permissions}
                      labelField="fullName"
                      keyField="id"
                      disabled={this.isEditingOwnAccount()}
                    />
                  )}
                <FormSelect
                  options={this.getUnassignedPermissions()}
                  onChange={this.onPermissionSelected}
                  fieldKey="id"
                  fieldLabel="fullName"
                  deafultLabel="Select Permissions"
                />
              </FormLabel>
            </fieldset>
          </div>
          <div className="UserAdministrator__form-actions">
            <Button state={this.getSubmitState()} type="submit">
              {this.isCreatingNewUser() ? 'Create User' : 'Save Edits'}
            </Button>
            {this.isCreatingNewUser() === false && (
              <Button onClick={this.resetUser} look="minimal">
                Cancel
              </Button>
            )}
          </div>
        </form>
        <UserTable hasModifiedUser={this.hasModifiedUser()} />
      </div>
    )
  }
}

export default connect(
  state => ({
    availablePermissions: state.permissions.all,
    user: state.users.user,
    users: state.users.users,
    createUserError: state.users.createUserError,
    createUserErrorMessage: state.users.createUserErrorMessage,
    loadUsersError: state.users.loadUsersError,
    authorizedUserId: state.auth.user.id,
    updateUserError: state.users.updateUserError,
    updateUserErrorMessage: state.users.updateUserErrorMessage,
    isUpdatingUser: state.users.isUpdatingUser,
    isCreatingUser: state.users.isCreatingUser,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        disableUser,
        createUser,
        buildUser,
        resetUser,
        updateUser,
      },
      dispatch,
    ),
  }),
)(UserAdministrator)
