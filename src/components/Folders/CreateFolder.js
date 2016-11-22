import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { createFolder } from '../../actions/folderAction'
import { getAllPermissions } from '../../actions/permissionsAction'
import { dismissCreateFolderModal } from '../../actions/appActions'
import AclEntry from '../../models/Acl'
import Permission from '../../models/Permission'

class CreateFolder extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,   // Title bar
    onDismiss: PropTypes.func,            // unmount
    onCreate: PropTypes.func.isRequired,  // passed Folder

    // Edit Mode adds an extra footer with info and controls
    isEditing: PropTypes.bool,            // Enables delete & link
    onDelete: PropTypes.func,             // only in edit mode
    onLink: PropTypes.func,               // only in edit mode

    // App State
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object.isRequired
  }

  state = { name: '', isShared: false, selectedPermissions: new Set() }

  componentWillMount () {
    // Move to a global location, pending cache invalidation issues
    this.props.actions.getAllPermissions()
  }

  changeName = (event) => {
    this.setState({ name: event.target.value })
  }

  checkForSubmit = (event) => {
    if (event.key === 'Enter' && this.state.name && this.state.name.length) {
      this.saveFolder(event)
    } else if (event.key === 'Escape') {
      this.dismiss()
    }
  }

  dismiss = () => {
    this.props.actions.dismissCreateFolderModal()
    if (this.props.onDismiss) {
      this.props.onDismiss(event)
    }
  }

  saveFolder = (event) => {
    const { name, selectedPermissions } = this.state
    // Create an acl from the selected permissions, assuming full access?
    const access = AclEntry.ReadAccess | AclEntry.WriteAccess | AclEntry.ExportAccess
    const acl = selectedPermissions && selectedPermissions.size
      ? Array.from(selectedPermissions).map(permission => (
        new AclEntry({ permissionId: permission.id, access })
      )) : undefined
    this.props.onCreate(name, acl)
    this.props.actions.dismissCreateFolderModal()
  }

  togglePublic = (event) => {
    this.setState({ isShared: event.target.checked })
  }

  togglePermission (permission, event) {
    let selectedPermissions = new Set(this.state.selectedPermissions)
    if (event.target.checked) {
      selectedPermissions.add(permission)
    } else {
      selectedPermissions.delete(permission)
    }
    this.setState({ selectedPermissions })
  }

  removePermission (permission) {
    let selectedPermissions = new Set(this.state.selectedPermissions)
    selectedPermissions.delete(permission)
    this.setState({ selectedPermissions })
  }

  render () {
    const { isEditing, title, permissions } = this.props
    const { isShared, selectedPermissions, name } = this.state
    return (
      <div className="CreateFolder flexRow flexAlignItemsCenter">
        <div className="CreateFolder-background" />
        <div className="CreateFolder-form">
          <div className="CreateFolder-header flexRow flexJustifySpaceBetween flexAlignItemsCenter">
            <div className="flexRow flexAlignItemsCenter">
              <div className="icon-cube"/>
              <div>{title}</div>
            </div>
            <div onClick={this.dismiss} className="icon-cross2" />
          </div>
          <div className="CreateFolder-body">
            <div className="CreateFolder-input-title">Title</div>
            <input autoFocus={true} type="text" placeholder="Name" onKeyDown={this.checkForSubmit} onChange={this.changeName} />
            <div className="CreateFolder-public-private flexRow flexAlignItemsCenter">
              <div>Collection is&nbsp;</div>
              <div className={classnames('CreateFolder-public-private', {disabled: isShared})}>Private</div>
              <input checked={isShared} onChange={this.togglePublic} type="checkbox"/>
              <div className={classnames('CreateFolder-public-private', {disabled: !isShared})}>Public</div>
            </div>
            { isShared && (
              <div className="CreateFolder-sharing">
                <div className="CreateFolder-shared-with flexRow flexWrap">
                  { Array.from(selectedPermissions).map(permission => (
                    <div key={permission.id} className="CreateFolder-selected-permission flexRow flexAlignItemsCenter">
                      {permission.name}
                      <div onClick={this.removePermission.bind(this, permission)} className="icon-cross"/>
                    </div>
                  ))}
                </div>
                <input type="text" placeholder="Filter permissions"/>
                <div className="CreateFolder-permissions flexCol">
                  { permissions && permissions.map(permission => (
                    <div key={permission.id} className="CreateFolder-permission flexRow flexAlignItemsCenter">
                      <input type="checkbox" id={permission.id} checked={selectedPermissions.has(permission)} onChange={this.togglePermission.bind(this, permission)}/>
                      <label htmlFor={permission.id}>{ permission.name }</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="CreateFolder-footer flexRow flexJustifyCenter">
            <button className={classnames('default', {disabled: (!name || !name.length)})} onClick={this.saveFolder}>Save</button>
            <button onClick={this.dismiss}>Cancel</button>
          </div>
          { isEditing && (
            <div className="CreateFolder-editing flexRow flexJustifySpaceBetween flexAlignItemsCenter">
              <div className="CreateFolder-editing-date flexRow">
                <div className="flexRow">
                  Created 9/2916 by
                </div>
                <div className="CreateFolder-editing-owner">
                  amber
                </div>
              </div>
              <div onClick={this.props.onLink} className="icon-link2"/>
              <div onClick={this.props.onDelete} className="icon-trash2"/>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  permissions: state.permissions && state.permissions.all
}), dispatch => ({
  actions: bindActionCreators({ createFolder, getAllPermissions, dismissCreateFolderModal }, dispatch)
}))(CreateFolder)
