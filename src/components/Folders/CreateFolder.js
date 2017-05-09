import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'
import AclEntry from '../../models/Acl'
import AclEditor from '../AclEditor'

class CreateFolder extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,   // Title bar
    acl: PropTypes.arrayOf(PropTypes.instanceOf(AclEntry)).isRequired,
    name: PropTypes.string,               // optional folder name
    date: PropTypes.node,                 // optional creation date
    onDismiss: PropTypes.func,            // unmount
    onCreate: PropTypes.func.isRequired,  // passed Folder
    onDelete: PropTypes.func,             // optional delete button
    onLink: PropTypes.func,               // optional link button

    // App State
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object.isRequired
  }

  state = {
    name: this.props.name || '',
    isShared: false,
    acl: null
  }

  changeName = (event) => {
    this.setState({ name: event.target.value })
  }

  checkForSubmit = (event) => {
    if (event.key === 'Enter' && this.state.name && this.state.name.length) {
      this.saveFolder(event)
    } else if (event.key === 'Escape') {
      this.dismiss(event)
    }
  }

  dismiss = (event) => {
    this.props.actions.hideModal()
    if (this.props.onDismiss) {
      this.props.onDismiss(event)
    }
  }

  deleteFolder = (event) => {
    this.props.onDelete(event)
    this.props.onDelete(event)
    this.dismiss(event)
  }

  saveFolder = (event) => {
    const { user } = this.props
    const { name, isShared } = this.state
    let acl = null
    if (isShared && acl) {
      acl = this.state.acl
    } else if (user && user.permissions) {
      // Look through this user's permissions for the one with 'user' type
      const permissionId = user.permissions.find(permission => (permission.type === 'user')).id
      const access = AclEntry.ReadAccess | AclEntry.WriteAccess | AclEntry.ExportAccess
      acl = [ new AclEntry({ permissionId, access }) ]
    }
    if (acl) {
      this.props.onCreate(name, acl)
      this.props.actions.hideModal()
    } else {
      console.error('Cannot determine permissions to create folder ' + name)
    }
  }

  togglePublic = (event) => {
    this.setState({ isShared: event.target.checked })
  }

  changeAcl = (acl) => {
    this.setState({acl})
  }

  render () {
    const { title, onLink, onDelete, user, date } = this.props
    const { isShared, name } = this.state
    return (
      <div className="CreateFolder flexRow flexAlignItemsCenter">
        <div className="CreateFolder-form">
          <div className="CreateFolder-header flexRow flexJustifySpaceBetween flexAlignItemsCenter">
            <div className="flexRow flexAlignItemsCenter">
              <div className="CreateFolder-header-icon icon-cube"/>
              <div>{title}</div>
            </div>
            <div onClick={this.dismiss} className="CreateFolder-header-close icon-cross2" />
          </div>
          <div className="CreateFolder-body">
            <div className="CreateFolder-input-title">Title</div>
            <input className="CreateFolder-input-title-input" autoFocus={true} type="text" placeholder="Name" onKeyDown={this.checkForSubmit} value={name} onChange={this.changeName} />
            <div className="CreateFolder-public-private flexRow flexAlignItemsCenter">
              <div>Collection is&nbsp;</div>
              <div className={classnames('CreateFolder-public-private', {disabled: isShared})}>Private</div>
              <input checked={isShared} onChange={this.togglePublic} type="checkbox"/>
              <div className={classnames('CreateFolder-public-private', {disabled: !isShared})}>Public</div>
            </div>
            { isShared && <AclEditor onChange={this.changeAcl} title="Folder Asset Permissions"/> }
          </div>
          <div className="CreateFolder-footer flexRow flexJustifyCenter">
            <button className={classnames('CreateFolder-save default', {disabled: (!name || !name.length)})} onClick={this.saveFolder}>Save</button>
            <button onClick={this.dismiss}>Cancel</button>
          </div>
          { (onLink || onDelete) && (
            <div className="CreateFolder-editing flexRow flexJustifySpaceBetween flexAlignItemsCenter">
              <div className="CreateFolder-editing-date flexRow">
                { date }
              </div>
              <div className="CreateFolder-editing-separator">by</div>
              <div className="CreateFolder-editing-owner">
                {user.username}
              </div>
              { onLink && <div onClick={onLink} className="icon-link2"/> }
              { onDelete && <div onClick={this.deleteFolder} className="icon-trash2"/> }
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  user: state.auth && state.auth.user
}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(CreateFolder)
