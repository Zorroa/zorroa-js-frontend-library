import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import * as assert from 'assert'

import { createFolder } from '../../actions/folderAction'
import { getAllPermissions } from '../../actions/permissionsAction'
import Permission from '../../models/Permission'

class CreateFolder extends Component {
  static propTypes = {
    parentId: PropTypes.number,   // modal if defined, otherwise only button
    folderId: PropTypes.number,   // modal if defined, forces EDIT mode
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object.isRequired
  }

  state = { name: '', showForm: false, isShared: false, selectedPermissions: new Set() }

  componentWillMount () {
    this.props.actions.getAllPermissions()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.folderId) {
      this.setState({...this.state, showForm: true})
    }
  }

  changeName (event) {
    this.setState({ ...this.state, name: event.target.value })
  }

  checkForSubmit (event) {
    if (event.key === 'Enter' && this.state.name && this.state.name.length && this.props.parentId) {
      this.saveFolder(event)
    } else if (event.key === 'Escape') {
      this.hideForm(event)
    }
  }

  saveFolder (event) {
    this.props.actions.createFolder(this.state.name, this.props.parentId)
    this.hideForm(event)
  }

  showForm (event) {
    this.setState({ ...this.state, showForm: true })
  }

  hideForm (event) {
    this.setState({ ...this.state, showForm: false })
  }

  togglePublic (event) {
    this.setState({ ...this.state, isShared: event.target.checked })
  }

  togglePermission (permission, event) {
    console.log('Set ' + permission.name + ' to ' + event.target.checked)
    let selectedPermissions = new Set(this.state.selectedPermissions)
    if (event.target.checked) {
      selectedPermissions.add(permission)
    } else {
      selectedPermissions.delete(permission)
    }
    this.setState({ ...this.state, selectedPermissions })
  }

  removePermission (permission) {
    let selectedPermissions = new Set(this.state.selectedPermissions)
    selectedPermissions.delete(permission)
    this.setState({ ...this.state, selectedPermissions })
  }

  linkFolder (event) {
    console.log('Link folder ' + this.props.folderId)
  }

  deleteFolder (event) {
    console.log('Delete folder ' + this.props.folderId)
    this.props.actions.deleteFolderIds(new Set(this.props.folderId))
  }

  render () {
    const { permissions, parentId, folderId } = this.props
    const { showForm, isShared, selectedPermissions, name } = this.state
    const isEditing = folderId
    const modeTitle = isEditing ? 'Edit' : 'Create'
    assert.ok(!isEditing || (isEditing && !parentId))
    return (
      <div className="CreateFolder flexRow flexAlignItemsCenter">
        <button disabled={!parentId} onClick={this.showForm.bind(this)}><span className="icon-plus-square"/>&nbsp;New Folder</button>
        { showForm && (parentId || folderId) && (
          <div className="CreateFolder-modal">
            <div className="CreateFolder-background" />
            <div className="CreateFolder-form">
              <div className="CreateFolder-header flexRow flexJustifySpaceBetween flexAlignItemsCenter">
                <div className="flexRow flexAlignItemsCenter">
                  <div className="icon-cube"/>
                  <div>{modeTitle} Simple Collection</div>
                </div>
                <div onClick={this.hideForm.bind(this)} className="icon-cross2" />
              </div>
              <div className="CreateFolder-body">
                <div className="CreateFolder-input-title">Title</div>
                <input autoFocus={true} type="text" placeholder="Name" onKeyDown={this.checkForSubmit.bind(this)} onChange={this.changeName.bind(this)} />
                <div className="CreateFolder-public-private flexRow flexAlignItemsCenter">
                  <div>Collection is&nbsp;</div>
                  <div className={classnames('CreateFolder-public-private', {disabled: isShared})}>Private</div>
                  <input checked={isShared} onChange={this.togglePublic.bind(this)} type="checkbox"/>
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
                <button className={classnames('default', {disabled: (!name || !name.length)})} onClick={this.saveFolder.bind(this)}>Save</button>
                <button onClick={this.hideForm.bind(this)}>Cancel</button>
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
                  <div onClick={this.linkFolder.bind(this)} className="icon-link2"/>
                  <div onClick={this.deleteFolder.bind(this)} className="icon-trash2"/>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(state => ({
  permissions: state.permissions && state.permissions.all
}), dispatch => ({
  actions: bindActionCreators({ createFolder, getAllPermissions }, dispatch)
}))(CreateFolder)
