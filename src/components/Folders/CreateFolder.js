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
    acl: PropTypes.arrayOf(PropTypes.instanceOf(AclEntry)).isRequired,
    name: PropTypes.string,               // optional folder name
    onDismiss: PropTypes.func,            // unmount
    onCreate: PropTypes.func.isRequired,  // passed Folder
    onDelete: PropTypes.func,             // optional delete button
    onLink: PropTypes.func,               // optional link button

    // App State
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object.isRequired
  }

  state = { name: this.props.name || '', isShared: false, selectedPermissionIds: new Set() }

  componentWillMount () {
    // Move to a global location, pending cache invalidation issues
    this.props.actions.getAllPermissions()
    this.updatePermissions(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updatePermissions(nextProps)
  }

  updatePermissions (props) {
    const { permissions, acl, name } = props
    let selectedPermissionIds = new Set()
    acl.forEach(aclEntry => {
      const permission = permissions.find(permission => (aclEntry.permissionId === permission.id))
      if (permission) selectedPermissionIds.add(permission.id)
    })
    this.setState({ selectedPermissionIds, name })
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
    this.props.actions.dismissCreateFolderModal()
    if (this.props.onDismiss) {
      this.props.onDismiss(event)
    }
  }

  deleteFolder = (event) => {
    this.props.onDelete(event)
    this.dismiss(event)
  }

  saveFolder = (event) => {
    const { name, selectedPermissionIds } = this.state
    // Create an acl from the selected permissions, assuming full access?
    const access = AclEntry.ReadAccess | AclEntry.WriteAccess | AclEntry.ExportAccess
    const acl = selectedPermissionIds && selectedPermissionIds.size
      ? Array.from(selectedPermissionIds).map(permissionId => (
        new AclEntry({ permissionId, access })
      )) : undefined
    this.props.onCreate(name, acl)
    this.props.actions.dismissCreateFolderModal()
  }

  togglePublic = (event) => {
    this.setState({ isShared: event.target.checked })
  }

  togglePermission (permission, event) {
    let selectedPermissionIds = new Set(this.state.selectedPermissionIds)
    if (event.target.checked) {
      selectedPermissionIds.add(permission.id)
    } else {
      selectedPermissionIds.delete(permission.id)
    }
    this.setState({ selectedPermissionIds })
  }

  permissionName (permissionId) {
    for (let permission of this.props.permissions) {
      if (permission.id === permissionId) return permission.name
    }
  }

  removePermission (permissionId) {
    let selectedPermissionIds = new Set(this.state.selectedPermissionIds)
    selectedPermissionIds.delete(permissionId)
    this.setState({ selectedPermissionIds })
  }

  render () {
    const { title, permissions, onLink, onDelete } = this.props
    const { isShared, selectedPermissionIds, name } = this.state
    return (
      <div className="CreateFolder flexRow flexAlignItemsCenter">
        <div className="CreateFolder-background flexRowCenter">
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
            <input autoFocus={true} type="text" placeholder="Name" onKeyDown={this.checkForSubmit} value={name} onChange={this.changeName} />
            <div className="CreateFolder-public-private flexRow flexAlignItemsCenter">
              <div>Collection is&nbsp;</div>
              <div className={classnames('CreateFolder-public-private', {disabled: isShared})}>Private</div>
              <input checked={isShared} onChange={this.togglePublic} type="checkbox"/>
              <div className={classnames('CreateFolder-public-private', {disabled: !isShared})}>Public</div>
            </div>
            { isShared && (
              <div className="CreateFolder-sharing">
                <div className="CreateFolder-shared-with flexRow flexWrap">
                  { Array.from(selectedPermissionIds).map(permissionId => (
                    <div key={permissionId} className="CreateFolder-selected-permission flexRow flexAlignItemsCenter">
                      {this.permissionName(permissionId)}
                      <div onClick={this.removePermission.bind(this, permissionId)} className="icon-cross"/>
                    </div>
                  ))}
                </div>
                <input type="text" placeholder="Filter permissions"/>
                <div className="CreateFolder-permissions flexCol">
                  { permissions && permissions.map(permission => (
                    <div key={permission.id} className="CreateFolder-permission flexRow flexAlignItemsCenter">
                      <input type="checkbox" id={permission.id} checked={selectedPermissionIds && selectedPermissionIds.has(permission.id)} onChange={this.togglePermission.bind(this, permission)}/>
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
          { (onLink || onDelete) && (
            <div className="CreateFolder-editing flexRow flexJustifySpaceBetween flexAlignItemsCenter">
              <div className="CreateFolder-editing-date flexRow">
                <div className="flexRow">
                  Created 9/2916 by
                </div>
                <div className="CreateFolder-editing-owner">
                  amber
                </div>
              </div>
              { onLink && <div onClick={onLink} className="icon-link2"/> }
              { onDelete && <div onClick={this.deleteFolder} className="icon-trash2"/> }
            </div>
          )}
        </div>
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
