import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import moment from 'moment'

import Table from '../Table'
import UserStatusToggle from './UserStatusToggle'
import { FormInput, FormLabel } from '../Form'
import './UserTable.scss'
import FlashMessage from '../FlashMessage'
import Heading from '../Heading'

import {
  loadUsers,
  disableUser,
  loadUser,
  resetUser,
} from '../../actions/usersActions'

function Field(asset, field, width) {
  let cellContent = asset[field] || 'N/A'

  if (field === 'enabled') {
    cellContent = <UserStatusToggle user={asset} />
  }

  if (field === 'loginDate' && asset[field] instanceof Date) {
    cellContent = (
      <div className="Table-cell UserForm__date">
        {moment(asset[field]).fromNow()}
      </div>
    )
  }

  if (field === 'loginCount') {
    const loginCount = asset[field]
    cellContent =
      typeof loginCount === 'number' ? loginCount.toLocaleString() : 'N/A'
  }

  if (field === 'email') {
    cellContent = <div className="Table-cell UserForm__link">{cellContent}</div>
  }

  return (
    <div
      className="Table-cell UserForm__cell"
      key={`${asset.id}-${field}`}
      style={{ width }}>
      {cellContent}
    </div>
  )
}

function FieldTitle(title) {
  return (
    <div className="UserForm__header-cell Table-cell">
      <span className="Table-title">
        <span className="Table-title-head">{title}</span>
      </span>
    </div>
  )
}

class UserTable extends Component {
  static propTypes = {
    hasModifiedUser: PropTypes.bool,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        email: PropTypes.string.isRequired,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        enabled: PropTypes.bool.isRequired,
      }),
    ),
    onSetActivePane: PropTypes.func.isRequired,
    actions: PropTypes.shape({
      loadUsers: PropTypes.func.isRequired,
      disableUser: PropTypes.func.isRequired,
      loadUser: PropTypes.func.isRequired,
      resetUser: PropTypes.func.isRequired,
    }),
  }

  state = {
    searchTerm: '',
  }

  componentDidMount() {
    if (this.props.users.length === 0) {
      this.props.actions.loadUsers()
    }
  }

  onSelect = (asset, event) => {
    const { id } = asset
    this.props.actions.loadUser(id)
    this.props.onSetActivePane('userEdit')
  }

  setSearchTerm = searchTerm => {
    this.setState({
      searchTerm,
    })
  }

  getFilteredUsers = () => {
    const searchTerm = this.state.searchTerm.toLowerCase()

    if (!searchTerm) {
      return this.props.users
    }

    return this.props.users.filter(
      user =>
        user.username.toLowerCase().search(searchTerm) >= 0 ||
        (user.lastName &&
          user.lastName.toLowerCase().search(searchTerm) >= 0) ||
        (user.firstName &&
          user.firstName.toLowerCase().search(searchTerm) >= 0) ||
        user.email.toLowerCase().search(searchTerm) >= 0,
    )
  }

  render() {
    const users = this.getFilteredUsers()

    return (
      <div className="UserTable">
        <Heading size="large" level="h2">
          Manage Users
        </Heading>
        {users.length === 0 &&
          !this.state.searchTerm &&
          (users.length === 0 && !this.state.searchTerm)}

        <FormLabel vertical label="Search users">
          <FormInput
            required
            className="UserTable__search"
            value={this.state.searchTerm}
            onChange={newSearchTerm => {
              this.setSearchTerm(newSearchTerm)
            }}
          />
        </FormLabel>
        {users.length === 0 &&
          this.state.searchTerm && (
            <FlashMessage look="warning">
              No users matched the search term {`"${this.state.searchTerm}."`}
            </FlashMessage>
          )}
        {users.length > 0 && (
          <Table
            assets={users}
            assetsCounter={users.length}
            selectionCounter={0}
            selectedAssetIds={new Set()}
            fields={[
              {
                field: 'email',
                title: FieldTitle('Email'),
                width: 125,
              },
              {
                field: 'firstName',
                title: FieldTitle('First Name'),
                width: 100,
              },
              {
                field: 'lastName',
                title: FieldTitle('Last Name'),
                width: 100,
              },
              {
                field: 'enabled',
                title: FieldTitle('Status'),
                width: 150,
              },
              {
                field: 'loginDate',
                title: FieldTitle('Last Login'),
                width: 150,
              },
              {
                field: 'loginCount',
                title: FieldTitle('Total Logins'),
                width: 150,
              },
            ]}
            tableIsResizing={false}
            selectFn={this.onSelect}
            elementFn={Field}
            look="clean"
            height={500}
            noScroll
            isSingleSelectOnly
          />
        )}
      </div>
    )
  }
}

export default connect(
  state => ({
    users: state.users.users,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        loadUsers,
        disableUser,
        loadUser,
        resetUser,
      },
      dispatch,
    ),
  }),
)(UserTable)
