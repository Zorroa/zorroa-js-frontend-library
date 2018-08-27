import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './UserForm.scss'
import randomAutoComplete from './randomAutoComplete'
import Heading from '../Heading'
import ListEditor from '../ListEditor'
import FlashMessage from '../FlashMessage'
import Password from './Password'
import { FormInput, FormLabel, FormSelect, FormButton as Button } from '../Form'
import Permission from '../../models/Permission'
import { buildUser } from '../../actions/usersActions'
import detectLoginSource from '../../services/detectLoginSource'

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
    authorizedUserId: PropTypes.string.isRequired,
    user: userShape,
    isCreatingUser: PropTypes.bool.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    heading: PropTypes.string.isRequired,
    buttonSubmitLabel: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitState: PropTypes.oneOf(['success', 'loading']),
    onCancel: PropTypes.func.isRequired,
    hasModifiedUser: PropTypes.bool,
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
        return (
          permission !== undefined &&
          assignedPermission !== undefined &&
          permission.fullName !== assignedPermission.fullName
        )
      },
    )

    this.onBuildEditableUser({
      permissions,
    })
  }

  onPermissionSelected = permission => {
    const permissions = [].concat(this.props.user.permissions)
    permissions.push(permission)
    this.onBuildEditableUser({
      permissions,
    })
  }

  isForeignUser() {
    return detectLoginSource(this.props.user.source) !== 'local'
  }

  isEditingOwnAccount() {
    return this.props.user.id === this.props.authorizedUserId
  }

  getUnassignedPermissions() {
    const assignedPermissions = (this.props.user.permissions || []).filter(
      permission => permission !== undefined,
    )
    const availablePermissions = (this.props.availablePermissions || []).filter(
      permission => {
        const isUserPermission = permission.fullName.search('user::') === 0
        return isUserPermission === false
      },
    )
    const hasNoAssignedPermissions = assignedPermissions.length === 0

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
      hasModifiedUser,
    } = this.props

    const { password, confirmPassword, oldPassword } = user

    return (
      <div className="UserForm">
        <form className="UserForm__form" onSubmit={this.onSubmit}>
          {this.isForeignUser() && (
            <FlashMessage look="warning">
              This user account is managed by an external identity provider.
              Certain fields are removed or are read-only.
            </FlashMessage>
          )}
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
                  required={!this.isForeignUser()}
                  readOnly={this.isForeignUser()}
                  value={user.email}
                  type="email"
                  autocomplete={randomAutoComplete()}
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
                  autocomplete={randomAutoComplete()}
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
                  autocomplete={randomAutoComplete()}
                  value={user.lastName}
                  onChange={lastName => {
                    this.onBuildEditableUser({ lastName })
                  }}
                />
              </FormLabel>
            </fieldset>
            <Password
              oldPassword={oldPassword}
              password={password}
              confirmPassword={confirmPassword}
              requireOriginalPassword={this.isEditingOwnAccount()}
              onChange={password => {
                this.onBuildEditableUser(password)
              }}
            />
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
            <Button
              title={
                hasModifiedUser === false
                  ? 'There are no changes to save'
                  : undefined
              }
              disabled={hasModifiedUser === false}
              state={submitState}
              type="submit">
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
  state => {
    return {
      availablePermissions: state.permissions.all,
      authorizedUserId: state.auth.user.id,
      isCreatingUser: state.users.isCreatingUser,
    }
  },
  dispatch => ({
    actions: bindActionCreators({ buildUser }, dispatch),
  }),
)(UserForm)
