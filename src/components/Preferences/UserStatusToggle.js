import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Toggle from '../Toggle'
import './UserStatusToggle.scss'

import { disableUser, enableUser } from '../../actions/usersActions'

class UserStatusToggle extends Component {
  static propTypes = {
    authorizedUser: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      enabled: PropTypes.bool.isRequired,
    }),
    usersBeingDisabled: PropTypes.arrayOf(PropTypes.number),
    actions: PropTypes.shape({
      disableUser: PropTypes.func.isRequired,
      enableUser: PropTypes.func.isRequired,
    }),
  }

  isLoading() {
    return this.props.usersBeingDisabled.indexOf(this.props.user.id) >= 0
  }

  isDisabled() {
    return this.props.user.id === this.props.authorizedUser.id
  }

  toggleUserState = () => {
    const { user } = this.props
    const { disableUser, enableUser } = this.props.actions

    if (this.isLoading() || this.isDisabled()) {
      return
    }

    if (user.enabled === true) {
      disableUser(user.id)
      return
    }

    enableUser(user.id)
  }

  onClick = event => {
    // Toggling the user status should not cause the user field to become populated
    // so prevent the event from bubbling
    event.stopPropagation()
  }

  render() {
    const classes = classnames('UserStatusToggle', {
      'UserStatusToggle--loading': this.isLoading(),
      'UserStatusToggle--disabled': this.isDisabled(),
    })

    return (
      <div className={classes} onClick={this.onClick}>
        <Toggle
          checked={this.props.user.enabled}
          onChange={this.toggleUserState}
          disabled={this.isDisabled()}
          waiting={this.isLoading()}
          disabledTitle="You cannot disable yourself"
        />
        <span className="UserStatusToggle__label">
          {this.props.user.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    )
  }
}

export default connect(
  state => ({
    usersBeingDisabled: state.users.usersBeingDisabled,
    authorizedUser: state.auth.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        disableUser,
        enableUser,
      },
      dispatch,
    ),
  }),
)(UserStatusToggle)
