import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'
import AclEntry from '../../models/Acl'
import AclEditor from '../AclEditor'
import Toggle from '../Toggle'

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
    includeAssets: PropTypes.bool,        // optionally include selected assets
    widgetLayout: PropTypes.bool,         // optionally allow save un-selected widgets
    dyhiLevels: PropTypes.arrayOf(PropTypes.shape({
      field: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired   // [Attr, Year, Month, Day, Path]
    })),

    // App State
    user: PropTypes.instanceOf(User),
    isolatedId: PropTypes.string,
    selectedAssetIds: PropTypes.instanceOf(Set),
    isManager: PropTypes.bool,
    actions: PropTypes.object.isRequired
  }

  state = {
    name: this.props.name || '',
    isShared: false,
    acl: null,
    includeSelectedAssets: this.props.includeAssets,
    mode: 'Search'                        // 'Search', 'Layout', 'Hierarchy'
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
    const { user, isolatedId, selectedAssetIds, dyhiLevels } = this.props
    const { name, isShared, includeSelectedAssets, mode } = this.state
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
      const assetIds = includeSelectedAssets && (isolatedId ? new Set(isolatedId) : selectedAssetIds)
      const assetsOrDyhis = includeSelectedAssets ? assetIds : (mode === 'Hierarchy' ? dyhiLevels : mode)
      this.props.onCreate(name, acl, assetsOrDyhis)
      this.props.actions.hideModal()
    } else {
      console.error('Cannot determine permissions to create folder ' + name)
    }
  }

  togglePublic = (event) => {
    this.setState({ isShared: event.target.checked })
  }

  toggleShareSelected = (event) => {
    this.setState({includeSelectedAssets: event.target.checked})
  }

  changeAcl = (acl) => {
    this.setState({acl})
  }

  changeMode = (mode) => {
    this.setState({mode})
  }

  renderModes () {
    const { isManager } = this.props
    if (!isManager) return
    const { widgetLayout, dyhiLevels } = this.props
    const { name, mode } = this.state
    const modes = ['Search']
    if (widgetLayout) modes.push('Layout')
    if (dyhiLevels) modes.push('Hierarchy')
    const cleanField = (field) => (field.endsWith('.raw') ? field.slice(0, -4) : field)
    return (
      <div>
        { modes.length > 1 && (
          <div className="CreateFolder-modes">
            {modes.map(m => (
              <div key={m} className={classnames('CreateFolder-mode', {selected: m === mode})}
                   onClick={_ => this.changeMode(m)}>{m}</div>
            ))}
          </div>
        )}
        { modes.length > 1 && mode === 'Search' && (
          <div className="CreateFolder-mode-info">
            Save the current search as a smart folder.
            Select the folder to restore the search.
            <div className="CreateFolder-dyhis">
              <div className="CreateFolder-section">Home</div>
              <div className="CreateFolder-dyhi">
                <div className="CreateFolder-dyhi-icon icon-collections-smart"/>
                <div className="CreateFolder-dyhi-root">{name}</div>
              </div>
            </div>
          </div>
        )}
        { mode === 'Layout' && (
          <div className="CreateFolder-mode-info">
            Save the current search without anything selected.
            Store layouts for each common workflow.
            <div className="CreateFolder-dyhis">
              <div className="CreateFolder-section">Home</div>
              <div className="CreateFolder-dyhi">
                <div className="CreateFolder-dyhi-icon icon-collections-smart"/>
                <div className="CreateFolder-dyhi-root">{name}</div>
              </div>
            </div>
          </div>
        )}
        { mode === 'Hierarchy' && (
          <div className="CreateFolder-mode-info">
            Save the current search as a folder hierarchy of the facet widgets from the current search:
            <div className="CreateFolder-dyhis">
              <div className="CreateFolder-section">Library</div>
              <div className="CreateFolder-dyhi">
                <div className="CreateFolder-dyhi-icon icon-foldercog"/>
                <div className="CreateFolder-dyhi-root">{name}</div>
              </div>
              { dyhiLevels.map((dyhi, i) => (
                <div key={`${dyhi.field}-${dyhi.type}`} className="CreateFolder-dyhi" style={{marginLeft: (i + 1) * 12}}>
                  <div className="CreateFolder-dyhi-indent">↳</div>
                  <div className="CreateFolder-dyhi-icon icon-folder-subfolders"/>
                  <div className="CreateFolder-dyhi-field">{cleanField(dyhi.field)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  render () {
    const { title, onLink, onDelete, user, date, selectedAssetIds, includeAssets, isManager } = this.props
    const { isShared, name, includeSelectedAssets } = this.state
    const disableIncludeSelected = !selectedAssetIds || !selectedAssetIds.size
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
            <input className="CreateFolder-input-title-input" autoFocus={true} type="text"
                   placeholder="Collection Name" onKeyDown={this.checkForSubmit}
                   value={name} onChange={this.changeName} />
            { this.renderModes() }
            { includeAssets && (
              <div className={classnames('CreateFolder-include-selected-assets', {disabled: disableIncludeSelected})}>
                <input type="checkbox" checked={includeSelectedAssets} disabled={disableIncludeSelected}
                       onChange={this.toggleShareSelected} />
                <div onClick={this.toggleShareSelected}>Include Selected Assets</div>
              </div>
            )}
            { isManager && !includeAssets && this.props.name && this.props.name.length && (
              <div className="CreateFolder-permissions">
                <div className="CreateFolder-public-private flexRow flexAlignItemsCenter">
                  <div>Collection is</div>
                  <div className={classnames('CreateFolder-public-private', {disabled: isShared})}>Private</div>
                  <Toggle checked={isShared} onChange={this.togglePublic}/>
                  <div className={classnames('CreateFolder-public-private', {disabled: !isShared})}>Public</div>
                </div>
                { isShared && <AclEditor onChange={this.changeAcl} title="Folder Asset Permissions"/> }
              </div>
            )}
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
  user: state.auth && state.auth.user,
  isolatedId: state.assets.isolatedId,
  selectedAssetIds: state.assets.selectedIds,
  isManager: state.auth.isManager
}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(CreateFolder)
