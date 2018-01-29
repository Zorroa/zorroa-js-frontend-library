import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import moment from 'moment'

import './UserAdministrator.scss'

import Table from '../Table'
import UserStatusToggle from './UserStatusToggle'

import {
  loadUsers,
  disableUser,
  loadUser,
  resetUser
} from '../../actions/usersActions'

function Field (asset, field, width) {
  let cellContent = asset[field] || 'N/A'

  if (field === 'enabled') {
    cellContent = (<UserStatusToggle user={asset} />)
  }

  if (field === 'loginDate' && asset[field] instanceof Date) {
    cellContent = (<div className="Table-cell UserAdministrator__date">
      { moment(asset[field]).fromNow() }
    </div>)
  }

  if (field === 'loginCount') {
    const loginCount = asset[field]
    cellContent = typeof loginCount === 'number' ? loginCount.toLocaleString() : 'N/A'
  }

  if (field === 'email') {
    cellContent = (<div className="Table-cell UserAdministrator__link">
      {cellContent}
    </div>)
  }

  return (
    <div className="Table-cell UserAdministrator__cell" key={`${asset.id}-${field}`} style={{width}}>
      {cellContent}
    </div>
  )
}

function FieldTitle (title) {
  return (
    <div className="UserAdministrator__header-cell">
      {title}
    </div>
  )
}

class UserTable extends Component {
  static propTypes = {
    hasModifiedUser: PropTypes.bool,
    users: PropTypes.arrayOf(PropTypes.shape({
      email: PropTypes.string.isRequired,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      enabled: PropTypes.bool.isRequired
    })),
    actions: PropTypes.shape({
      loadUsers: PropTypes.func.isRequired,
      disableUser: PropTypes.func.isRequired,
      loadUser: PropTypes.func.isRequired,
      resetUser: PropTypes.func.isRequired
    })
  }

  constructor (props) {
    super(props)
    this.state = {
      selectedUsers: new Set([])
    }
  }

  componentDidMount () {
    if (this.props.users.length === 0) {
      this.props.actions.loadUsers()
    }
  }

  onSelect = (asset, event) => {
    const warningMessage = 'You are about to loose changes for the user you are editing. Are you sure you want to discard them?'
    const {id} = asset
    const isSelectingDifferentUser = this.state.selectedUsers.has(id) === false
    let selectedUsers = new Set([])

    if (this.props.hasModifiedUser === true && window.confirm(warningMessage) === false) {
      return
    }

    if (isSelectingDifferentUser) {
      this.props.actions.loadUser(id)
      selectedUsers = new Set([id])
    } else {
      this.props.actions.resetUser()
    }

    this.setState({
      selectedUsers
    })
  }

  render () {
    return (
      <div className="UserTable">
        <Table
          assets={this.props.users}
          assetsCounter={this.props.users.length}
          selectionCounter={0}
          selectedAssetIds={this.state.selectedUsers}
          fields={[{
            field: 'email',
            title: FieldTitle('Email'),
            width: 125
          }, {
            field: 'firstName',
            title: FieldTitle('First Name'),
            width: 100
          }, {
            field: 'lastName',
            title: FieldTitle('Last Name'),
            width: 100
          }, {
            field: 'enabled',
            title: FieldTitle('Status'),
            width: 150
          }, {
            field: 'loginDate',
            title: FieldTitle('Last Login'),
            width: 150
          }, {
            field: 'loginCount',
            title: FieldTitle('Total Logins'),
            width: 150
          }]}
          height={200}
          tableIsResizing={false}
          selectFn={this.onSelect}
          elementFn={Field}
          look="clean"
          isSingleSelectOnly={true}
        />
      </div>
    )
  }
}

export default connect(state => ({
  users: state.users.users
}), dispatch => ({
  actions: bindActionCreators({
    loadUsers,
    disableUser,
    loadUser,
    resetUser
  }, dispatch)
}))(UserTable)
