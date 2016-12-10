import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { createFolder } from '../../actions/folderAction'
import { getAllPermissions } from '../../actions/permissionsAction'
import { dismissCreateFolderModal } from '../../actions/appActions'
import User from '../../models/User'
import AclEntry, { isPublic } from '../../models/Acl'
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
    user: PropTypes.instanceOf(User),
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object.isRequired
  }

  state = {
    name: this.props.name || '',
    isShared: false,
    selectedPermissionIds: new Map(),
    filterText: ''
  }

  componentWillMount () {
    // Move to a global location, pending cache invalidation issues
    this.props.actions.getAllPermissions()
    this.updatePermissions(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updatePermissions(nextProps)
  }

  updatePermissions (props) {
    const { user, permissions, acl } = props
    const { name } = this.state
    let selectedPermissionIds = new Map()
    acl.forEach(aclEntry => {
      const permission = permissions.find(permission => (aclEntry.permissionId === permission.id))
      if (permission) selectedPermissionIds.set(permission.id, aclEntry.access)
    })
    const isShared = isPublic(acl, user, permissions)
    this.setState({ selectedPermissionIds, isShared, name })
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
    this.props.onDelete(event)
    this.dismiss(event)
  }

  saveFolder = (event) => {
    const { user } = this.props
    const { name, isShared, selectedPermissionIds } = this.state
    let acl = null
    if (isShared) {
      acl = selectedPermissionIds && selectedPermissionIds.size
        ? Array.from(selectedPermissionIds).map(([permissionId, access]) => (
        new AclEntry({ permissionId, access }))) : undefined
    } else {
      // Look through this user's permissions for the one with 'user' type
      const permissionId = user.permissions.find(permission => (permission.type === 'user')).id
      acl = [ new AclEntry({ permissionId, access: this.permissionsForValue(3) }) ]
    }
    this.props.onCreate(name, acl)
    this.props.actions.dismissCreateFolderModal()
  }

  togglePublic = (event) => {
    this.setState({ isShared: event.target.checked })
  }

  togglePermission (permission, event) {
    let selectedPermissionIds = new Map(this.state.selectedPermissionIds)
    if (event.target.checked) {
      selectedPermissionIds.set(permission.id, AclEntry.ReadAccess)
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

  permissionIcon (permissionId) {
    for (let permission of this.props.permissions) {
      if (permission.id === permissionId) {
        return permission.type === 'group' ? 'icon-public' : 'icon-private'
      }
    }
  }

  permissionValue (access) {
    if (access & AclEntry.ExportAccess) return 3
    if (access & AclEntry.WriteAccess) return 2
    if (access & AclEntry.ReadAccess) return 1
    return -1   // Avoid undefined since this is used for input:value
  }

  permissionsForValue (value) {
    switch (value) {
      case 1: return AclEntry.ReadAccess
      case 2: return AclEntry.ReadAccess | AclEntry.WriteAccess
      case 3: return AclEntry.ReadAccess | AclEntry.WriteAccess | AclEntry.ExportAccess
    }
  }

  removePermission (permissionId) {
    let selectedPermissionIds = new Map(this.state.selectedPermissionIds)
    selectedPermissionIds.delete(permissionId)
    this.setState({ selectedPermissionIds })
  }

  changePermission (permissionId, event) {
    let selectedPermissionIds = new Map(this.state.selectedPermissionIds)
    const value = parseInt(event.target.value, 10)
    selectedPermissionIds.set(permissionId, this.permissionsForValue(value))
    this.setState({ selectedPermissionIds })
  }

  changeFilterText = (event) => {
    this.setState({ filterText: event.target.value })
  }

  renderPermissionSlider (permissionId, access) {
    return (
      <div className="flexRow flexAlignItemsCenter">
        <div className="CreateFolder-perm-slider">
          <div className="CreateFolder-perms-tick-row">
            <div className={classnames('CreateFolder-perms-tick', {ticked: access & AclEntry.ReadAccess})} style={{left: '0%'}}/>
            <div className={classnames('CreateFolder-perms-tick', {ticked: access & AclEntry.WriteAccess})} style={{left: '50%'}}/>
            <div className={classnames('CreateFolder-perms-tick', {ticked: access & AclEntry.ExportAccess})} style={{left: '100%'}}/>
          </div>
          <progress className="CreateFolder-perm-progress" min={0} max={2} value={this.permissionValue(access) - 1} />
          <input className="CreateFolder-perms-input" type="range" min="1" max="3" step="1" value={this.permissionValue(access)} onChange={this.changePermission.bind(this, permissionId)} />
        </div>
        <div onClick={this.removePermission.bind(this, permissionId)} className="icon-cross2"/>
      </div>
    )
  }

  renderPermissions (name, icon, permissions) {
    if (!permissions || !permissions.length) return
    const { selectedPermissionIds } = this.state
    return (
      <div className="CreateFolder-permissions flexCol">
        <div className="flexRow flexAlignItemsCenter">
          <div className={icon}/>
          <div className="CreateFolder-permission-title">{name}</div>
        </div>
        <div className="CreateFolder-permission-items">
          { permissions.map(permission => (
            <div key={permission.id} className="CreateFolder-permission flexRow flexAlignItemsCenter">
              <input type="checkbox" id={permission.id} checked={selectedPermissionIds && selectedPermissionIds.has(permission.id)} onChange={this.togglePermission.bind(this, permission)}/>
              <label htmlFor={permission.id}>{ permission.name }</label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  render () {
    const { title, permissions, onLink, onDelete } = this.props
    const { isShared, selectedPermissionIds, name, filterText } = this.state
    const lcFilterText = filterText.toLowerCase()
    const groupPermissions = permissions.filter(permission => (
      permission.type === 'group' &&
      permission.name.toLowerCase().includes(lcFilterText)
    ))
    const userPermissions = permissions.filter(permission => (
      permission.type === 'user' &&
      permission.name.toLowerCase().includes(lcFilterText)
    ))
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
            <input className="CreateFolder-input-title-input" autoFocus={true} type="text" placeholder="Name" onKeyDown={this.checkForSubmit} value={name} onChange={this.changeName} />
            <div className="CreateFolder-public-private flexRow flexAlignItemsCenter">
              <div>Collection is&nbsp;</div>
              <div className={classnames('CreateFolder-public-private', {disabled: isShared})}>Private</div>
              <input checked={isShared} onChange={this.togglePublic} type="checkbox"/>
              <div className={classnames('CreateFolder-public-private', {disabled: !isShared})}>Public</div>
            </div>
            { isShared && (
              <div className="CreateFolder-sharing">
                <div className="CreateFolder-shared-with">
                  { selectedPermissionIds.size ? (
                    <div className="CreateFolder-shared-with-title">
                      <div>Shared With</div>
                      <div className="CreateFolder-shared-with-perm-icons">
                        <div className="icon-eye"/>
                        <div className="icon-pen"/>
                        <div className="icon-export"/>
                      </div>
                    </div>) : <div/>}
                  <div className="CreateFolder-shared-with-permissions">
                    { Array.from(selectedPermissionIds).map(([permissionId, access]) => (
                      <div key={permissionId} className="CreateFolder-selected-permission">
                        <div className="flexRow flexAlignItemsCenter">
                          <div className={this.permissionIcon(permissionId)}/>
                          {this.permissionName(permissionId)}
                        </div>
                        { this.renderPermissionSlider(permissionId, access) }
                      </div>
                    ))}
                  </div>
                </div>
                <div className="CreateFolder-filter-permission">
                  <div className="icon-search"/>
                  <input type="text"
                         value={filterText} onChange={this.changeFilterText}
                         className="CreateFolder-filter-permission-input" placeholder="Filter permissions"/>
                </div>
                { this.renderPermissions('Groups', 'icon-public', groupPermissions) }
                { this.renderPermissions('Individuals', 'icon-private', userPermissions) }
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
  user: state.auth && state.auth.user,
  permissions: state.permissions && state.permissions.all
}), dispatch => ({
  actions: bindActionCreators({ createFolder, getAllPermissions, dismissCreateFolderModal }, dispatch)
}))(CreateFolder)
