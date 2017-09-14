import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Permission from '../../models/Permission'
import AclEntry, { isPublic } from '../../models/Acl'
import { getAllPermissions } from '../../actions/permissionsAction'
import Filter from '../Filter'

class AclEditor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    acl: PropTypes.arrayOf(PropTypes.instanceOf(AclEntry)),
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object
  }

  static defaultProps = {
    acl: []
  }

  state = {
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
    const { permissions, acl } = props
    const { name } = this.state
    let selectedPermissionIds = new Map()
    acl.forEach(aclEntry => {
      const permission = permissions.find(permission => (aclEntry.permissionId === permission.id))
      if (permission) selectedPermissionIds.set(permission.id, aclEntry.access)
    })
    this.setState({ selectedPermissionIds, name })
  }

  togglePermission (permission, event) {
    let selectedPermissionIds = new Map(this.state.selectedPermissionIds)
    if (event.target.checked) {
      selectedPermissionIds.set(permission.id, AclEntry.ReadAccess)
    } else {
      selectedPermissionIds.delete(permission.id)
    }
    this.setState({ selectedPermissionIds }, this.changeAcl)
  }

  setAccess (access, event) {
    let selectedPermissionIds = new Map()
    this.state.selectedPermissionIds.forEach((value, key) => {
      selectedPermissionIds.set(key, access)
    })
    this.setState({ selectedPermissionIds }, this.changeAcl)
  }

  permissionName (permissionId) {
    for (let permission of this.props.permissions) {
      if (permission.id === permissionId) return permission.name
    }
  }

  permissionIcon (permissionId) {
    for (let permission of this.props.permissions) {
      if (permission.id === permissionId) {
        return permission.type === 'group' ? 'icon-group' : undefined
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
    this.setState({ selectedPermissionIds }, this.changeAcl)
  }

  changePermission (permissionId, event) {
    let selectedPermissionIds = new Map(this.state.selectedPermissionIds)
    const value = parseInt(event.target.value, 10)
    selectedPermissionIds.set(permissionId, this.permissionsForValue(value))
    this.setState({ selectedPermissionIds }, this.changeAcl)
  }

  changeFilterText = (event) => {
    this.setState({ filterText: event.target.value })
  }

  changeAcl = () => {
    const { selectedPermissionIds } = this.state
    const acl = selectedPermissionIds && selectedPermissionIds.size
      ? Array.from(selectedPermissionIds).map(([permissionId, access]) => (
        new AclEntry({ permissionId, access }))) : undefined
    this.props.onChange(acl)
  }

  renderPermissionSlider (permissionId, access) {
    return (
      <div className="flexRow flexAlignItemsCenter">
        <div className="AclEditor-perm-slider">
          <div className="AclEditor-perms-tick-row">
            <div className={classnames('AclEditor-perms-tick', {ticked: access & AclEntry.ReadAccess})} style={{left: '0%'}}/>
            <div className={classnames('AclEditor-perms-tick', 'medium', {ticked: access & AclEntry.WriteAccess})} style={{left: '50%'}}/>
            <div className={classnames('AclEditor-perms-tick', 'large', {ticked: access & AclEntry.ExportAccess})} style={{left: '100%'}}/>
          </div>
          <progress className="AclEditor-perm-progress" min={0} max={2} value={this.permissionValue(access) - 1} />
          <input className="AclEditor-perms-input" type="range" min="1" max="3" step="1" value={this.permissionValue(access)} onChange={this.changePermission.bind(this, permissionId)} />
        </div>
        <div onClick={this.removePermission.bind(this, permissionId)} className="icon-cross"/>
      </div>
    )
  }

  renderPermissions (name, icon, permissions) {
    if (!permissions || !permissions.length) return
    const { selectedPermissionIds } = this.state
    return (
      <div className="AclEditor-permissions flexCol">
        <div className="flexRow flexAlignItemsCenter">
          <div className="AclEditor-permission-title">{name}</div>
        </div>
        <div className="AclEditor-permission-items">
          { permissions.map(permission => (
            <div key={permission.id} className="AclEditor-permission">
              <input type="checkbox" name={`${permission.type}__${permission.name}`} id={permission.id} checked={selectedPermissionIds && selectedPermissionIds.has(permission.id)} onChange={this.togglePermission.bind(this, permission)}/>
              <label htmlFor={permission.id} className={classnames('AclEditor-permission-icon', icon)}/>
              <label htmlFor={permission.id} className="AclEditor-permission-name">{permission.name}</label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  render () {
    const { permissions } = this.props
    const { selectedPermissionIds, filterText } = this.state
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
      <div className="AclEditor">
        <div className="AclEditor-acl">
          <div className="AclEditor-shared-with">
            { selectedPermissionIds.size ? (
              <div className="AclEditor-shared-with-title">
                <div>Shared With</div>
                <div className="AclEditor-shared-with-perm-icons">
                  <div className="icon-eye2" onClick={this.setAccess.bind(this, this.permissionsForValue(1))} />
                  <div className="icon-pen" onClick={this.setAccess.bind(this, this.permissionsForValue(2))} />
                  <div className="icon-export" onClick={this.setAccess.bind(this, this.permissionsForValue(3))} />
                </div>
              </div>) : (
                <div className="AclEditor-empty">
                  <div className="AclEditor-empty-icon icon-emptybox"/>
                  <div className="AclEditor-empty-label">No Permissions</div>
                </div>
            )}
          </div>
          <div className="AclEditor-shared-with-permissions">
            { Array.from(selectedPermissionIds).map(([permissionId, access]) => (
              <div key={permissionId} className="AclEditor-selected-permission">
                <div className="flexRow flexAlignItemsCenter">
                  <div className={this.permissionIcon(permissionId)}/>
                  {this.permissionName(permissionId)}
                </div>
                { this.renderPermissionSlider(permissionId, access) }
              </div>
            ))}
          </div>
        </div>
        <div className="AclEditor-controls">
          <Filter value={filterText} onChange={this.changeFilterText}
                  placeholder="Search groups and individuals"/>
          { this.renderPermissions('Groups', 'icon-group', groupPermissions) }
          { this.renderPermissions('Individuals', undefined, userPermissions) }
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  permissions: state.permissions.all
}), dispatch => ({
  actions: bindActionCreators({ getAllPermissions }, dispatch)
}))(AclEditor)
