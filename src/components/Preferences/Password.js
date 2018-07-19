import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { FormInput, FormLabel } from '../Form'
import randomAutoComplete from './randomAutoComplete'

export default class Password extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    requireOriginalPassword: PropTypes.bool,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
    oldPassword: PropTypes.string,
  }

  requireOriginalPassword() {
    return this.props.requireOriginalPassword === true
  }

  onChange = passwordValues => {
    const { password, confirmPassword, oldPassword } = passwordValues

    const changedValues = {}

    if (password !== undefined) {
      changedValues.password = password
    }

    if (confirmPassword !== undefined) {
      changedValues.confirmPassword = confirmPassword
    }

    if (oldPassword !== undefined) {
      changedValues.oldPassword = oldPassword
    }

    this.props.onChange(changedValues)
  }

  isPasswordValid() {
    const { password, confirmPassword, oldPassword } = this.props
    const isCreatingNewPassword = this.requireOriginalPassword() === false
    const isPasswordEntered =
      password !== undefined && confirmPassword !== undefined
    const doPasswordsMatch = password === confirmPassword
    const mustEnterOldPassword =
      this.requireOriginalPassword() && oldPassword === undefined

    if (isCreatingNewPassword === false && isPasswordEntered === false) {
      return true
    }

    const isPasswordChangeValid =
      (isCreatingNewPassword === true &&
        isPasswordEntered === true &&
        doPasswordsMatch === true) ||
      (isPasswordEntered === true &&
        doPasswordsMatch === true &&
        mustEnterOldPassword === false)

    return isPasswordChangeValid
  }

  render() {
    const {
      password,
      confirmPassword,
      oldPassword,
      requireOriginalPassword,
    } = this.props
    const isPasswordChangeInvalid =
      this.isPasswordValid() === false && confirmPassword !== undefined

    return (
      <fieldset className="UserForm__field-group">
        <div>
          {requireOriginalPassword === true && (
            <FormLabel
              vertical
              error={isPasswordChangeInvalid}
              label="Current Password"
              className="UserForm__form-element">
              <FormInput
                onChange={password => {
                  this.onChange({ oldPassword: password })
                }}
                value={oldPassword}
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
                this.onChange({ password })
              }}
              autocomplete={randomAutoComplete()}
              value={password}
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
                this.onChange({ confirmPassword })
              }}
              autocomplete={randomAutoComplete()}
              value={confirmPassword}
              error={isPasswordChangeInvalid}
              type="password"
            />
            {isPasswordChangeInvalid && (
              <span>
                {this.requireOriginalPassword() === false &&
                  'Passwords don’t match'}
                {this.requireOriginalPassword() === true &&
                  'Passwords don’t match or you must enter your old password'}
              </span>
            )}
          </FormLabel>
        </div>
      </fieldset>
    )
  }
}
