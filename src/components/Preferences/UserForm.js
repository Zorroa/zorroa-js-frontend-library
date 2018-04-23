import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import './UserForm.scss'
import Heading from '../Heading'
import ListEditor from '../ListEditor'
import { FormInput, FormLabel, FormSelect, FormButton as Button } from '../Form'
import Permission from '../../models/Permission'
import { buildUser } from '../../actions/usersActions'

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

class UserForm extends Component {
  static propTypes = {
    authorizedUserId: PropTypes.number.isRequired,
    user: userShape,
    isCreatingUser: PropTypes.bool.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    heading: PropTypes.string.isRequired,
    buttonSubmitLabel: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitState: PropTypes.oneOf(['success', 'loading']),
    onCancel: PropTypes.func.isRequired,
    actions: PropTypes.shape({
      buildUser: PropTypes.func.isRequired,
    }),
  }

  onBuildEditableUser(user) {
    this.props.actions.buildUser(user)
  }

  isCreatingNewUser() {
    return this.props.user.id === undefined
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

  onPermissionDelete = permission => {
    if (this.props.user.permissions === undefined) {
      return
    }

    const permissions = this.props.user.permissions.filter(
      assignedPermission => {
        return permission.fullName !== assignedPermission.fullName
      },
    )

    this.onBuildEditableUser({
      permissions,
    })
  }

  onPermissionSelected = permission => {
    const permissions = this.props.user.permissions || []
    permissions.push(permission)
    this.onBuildEditableUser({
      permissions,
    })
  }

  isEditingOwnAccount() {
    return this.props.user.id === this.props.authorizedUserId
  }

  getUnassignedPermissions() {
    const assignedPermissions = this.props.user.permissions
    const availablePermissions = this.props.availablePermissions || []
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

  onSubmit = event => {
    event.preventDefault()

    if (this.isPasswordValid() === true) {
      this.props.onSubmit(event)
    }
  }

  render() {
    const {
      user,
      buttonSubmitLabel,
      heading,
      submitState,
      onCancel,
    } = this.props
    const isPasswordChangeInvalid =
      this.isPasswordValid() === false && user.confirmPassword !== undefined

    return (
      <div className="UserForm">
        <form className="UserForm__form" onSubmit={this.onSubmit}>
          <Heading size="large" level="h2">
            {heading}
          </Heading>
          <div className="UserForm__fields">
            <fieldset className="UserForm__field-group">
              <FormLabel
                vertical
                label="Email (used For username)"
                className="UserForm__form-element">
                <FormInput
                  required
                  value={user.email}
                  type="email"
                  onChange={email => {
                    this.onBuildEditableUser({ email })
                  }}
                />
              </FormLabel>
              <FormLabel
                vertical
                label="First Name"
                className="UserForm__form-element">
                <FormInput
                  required
                  value={user.firstName}
                  onChange={firstName => {
                    this.onBuildEditableUser({ firstName })
                  }}
                />
              </FormLabel>
              <FormLabel
                vertical
                label="Last Name"
                className="UserForm__form-element">
                <FormInput
                  required
                  value={user.lastName}
                  onChange={lastName => {
                    this.onBuildEditableUser({ lastName })
                  }}
                />
              </FormLabel>
            </fieldset>
            <fieldset className="UserForm__field-group">
              {this.isEditingOwnAccount() && (
                <FormLabel
                  vertical
                  error={isPasswordChangeInvalid}
                  label="Original Password"
                  className="UserForm__form-element">
                  <FormInput
                    onChange={password => {
                      this.onBuildEditableUser({ oldPassword: password })
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
                className="UserForm__form-element">
                <FormInput
                  onChange={password => {
                    this.onBuildEditableUser({ password })
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
                className="UserForm__form-element">
                <FormInput
                  onChange={confirmPassword => {
                    this.onBuildEditableUser({ confirmPassword })
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
          </div>
          <div className="UserForm__fields">
            <fieldset className="UserForm__field-group UserForm__field-group--permissions">
              <Heading size="small" level="h3">
                Manage Permissions
              </Heading>
              <FormLabel
                vertical
                label="Permissions"
                className="UserForm__form-element">
                {this.getUnassignedPermissions().length > 0 && (
                  <FormSelect
                    options={this.getUnassignedPermissions()}
                    onChange={this.onPermissionSelected}
                    fieldKey="id"
                    fieldLabel="fullName"
                    deafultLabel="Add Permissions"
                  />
                )}
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
              </FormLabel>
            </fieldset>
          </div>
          <div className="UserForm__form-actions">
            <Button state={submitState} type="submit">
              {buttonSubmitLabel}
            </Button>
            {this.isCreatingNewUser() === false && (
              <Button onClick={onCancel} look="minimal">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    )
  }
}

export default connect(
  state => ({
    availablePermissions: state.permissions.all,
    authorizedUserId: state.auth.user.id,
    isCreatingUser: state.users.isCreatingUser,
  }),
  dispatch => ({
    actions: bindActionCreators({ buildUser }, dispatch),
  }),
)(UserForm)
