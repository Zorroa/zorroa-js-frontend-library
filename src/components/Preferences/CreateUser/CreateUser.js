import React, { Component, PropTypes } from 'react'

import FlashMessage from '../../FlashMessage'
import UserForm from '../UserForm'
import Permission from '../../../models/Permission'

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

export default class CreateUser extends Component {
  static propTypes = {
    createUserError: PropTypes.bool.isRequired,
    createUserErrorMessage: PropTypes.string.isRequired,
    user: userShape,
    onSetActivePane: PropTypes.func.isRequired,
    isCreatingUser: PropTypes.bool.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.shape({
      createUser: PropTypes.func.isRequired,
      resetUser: PropTypes.func.isRequired,
    }),
  }

  state = {
    showSubmitSuccess: false,
  }

  componentDidMount() {
    this.props.actions.resetUser()
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isCreatingUser === false &&
      this.props.isCreatingUser === true &&
      nextProps.createUserError === false
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
            this.props.actions.resetUser()
            this.props.onSetActivePane('user')
          }, 1000)
        },
      )
    }
  }

  onSubmit = event => {
    const { user } = this.props
    const permissions = (user.permissions || []).filter(
      permission => typeof permission === 'object',
    )
    const permissionIds = Array.isArray(permissions)
      ? permissions.map(permission => permission.id)
      : undefined

    this.props.actions.createUser({
      username: user.email,
      password: user.password,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      permissionIds,
    })
  }

  resetUser = event => {
    event.preventDefault()
    this.props.actions.resetUser()
  }

  getSubmitState() {
    if (this.state.showSubmitSuccess === true) {
      return 'success'
    }

    if (this.props.isCreatingUser === true) {
      return 'loading'
    }
  }

  render() {
    return (
      <div>
        {this.props.createUserError && (
          <FlashMessage look="error">
            {this.props.createUserErrorMessage}
          </FlashMessage>
        )}
        <UserForm
          user={this.props.user}
          heading="Create User"
          buttonSubmitLabel="Create User"
          onSubmit={this.onSubmit}
          submitState={this.getSubmitState()}
          onCancel={this.resetUser}
        />
      </div>
    )
  }
}
