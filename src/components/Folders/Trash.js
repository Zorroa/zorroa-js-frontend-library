import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import TrashedFolder from '../../models/TrashedFolder'
import { isPublic } from '../../models/Acl'
import { selectFolderId } from '../../actions/folderAction'
import { getTrashedFolders, countTrashedFolders, emptyFolderTrash, deleteTrashedFolders, restoreTrashedFolders } from '../../actions/trashedFolderActions'

class Trash extends Component {
  static propTypes = {
    filterName: PropTypes.string.isRequired,
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    selectedFolderIds: PropTypes.instanceOf(Set),
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object
  }

  state = {
    isOpen: false,
    contextMenuTrashedFolderId: null
  }

  showContextMenu (trashedFolder, event) {
    event.preventDefault()
    // Isolate-select if the clicked folder is not selected
    if (!this.props.selectedFolderIds.has(trashedFolder.folderId)) {
      this.selectFolder(trashedFolder, {shiftKey: false, metaKey: false})
    }
    this.setState({ contextMenuTrashedFolderId: trashedFolder.id })
  }

  dismissContextMenu = (event) => {
    if (event) event.preventDefault()
    this.setState({ contextMenuTrashedFolderId: null })
  }

  toggleOpen = (event) => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  emptyTrash = (event) => {
    this.props.actions.emptyFolderTrash()
  }

  restoreSelected (trashedFolder, event) {
    this.props.actions.restoreTrashedFolders(this.selectedTrashedFolderIds(trashedFolder))
  }

  deleteSelected (trashedFolder, event) {
    this.props.actions.deleteTrashedFolders(this.selectedTrashedFolderIds(trashedFolder))
  }

  selectedTrashedFolderIds (trashedFolder) {
    const { trashedFolders, selectedFolderIds } = this.props
    const selectedTrashedFolderIds = [ trashedFolder.id ]
    selectedFolderIds.forEach(folderId => {
      // Make sure the selected folder is a trash folder
      const index = folderId !== trashedFolder.folderId && trashedFolders ? trashedFolders.findIndex(tf => (tf.folderId === folderId)) : -1
      if (index >= 0) {
        // Convert the selected FOLDER id into a TRASHED folder id
        selectedTrashedFolderIds.push(trashedFolders[index].id)
      }
    })
    return selectedTrashedFolderIds
  }

  selectFolder (trashedFolder, event) {
    this.props.actions.selectFolderId(trashedFolder.folderId, event.shiftKey, event.metaKey,
      this.props.trashedFolders, this.props.selectedFolderIds)
  }

  renderContextMenu (trashedFolder) {
    return (
      <div>
        <div onClick={this.dismissContextMenu} className="FolderItem-context-menu-background" onContextMenu={this.dismissContextMenu} />
        <div className="FolderItem-context-menu" onContextMenu={this.dismissContextMenu}>
          <div onClick={this.restoreSelected.bind(this, trashedFolder)}
               className="Trash-context-item"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-settings_backup_restore"/>
            <div>Restore Folder</div>
          </div>
          <div onClick={this.deleteSelected.bind(this, trashedFolder)}
               className="Trash-context-item"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-trash2"/>
            <div>Remove Permanently</div>
          </div>
        </div>
      </div>
    )
  }

  renderPermission (acl) {
    const { user } = this.props
    const permisionIcon = isPublic(user, user.permissions) ? 'icon-public' : undefined
    if (isPublic(acl, user, user.permissions)) {
      return <div className={classnames('FolderItem-permission', permisionIcon)}/>
    }
  }

  render () {
    const { filterName, trashedFolders, selectedFolderIds } = this.props
    const { isOpen, contextMenuTrashedFolderId } = this.state
    const hasChildren = trashedFolders && trashedFolders.length > 0
    const isSelected = false
    const isDropTarget = false
    if (!trashedFolders) {
      this.props.actions.getTrashedFolders()
      return null
    }
    // Filter for trash location, only used in simple or smart for now
    const filteredTrashedFolders = trashedFolders.filter(trashedFolder => {
      switch (filterName) {
        case 'simple':
          return !trashedFolder.search
        case 'smart':
          return trashedFolder.search
      }
    })
    if (!filteredTrashedFolders.length) return null
    return (
      <div className={classnames('Trash', {isOpen, hasChildren, isSelected, isDropTarget})} >
        <div className="Trash-header">
          <div className='Trash-toggle' onClick={this.toggleOpen}>
            {(hasChildren) ? <i className='Trash-toggleArrow icon-triangle-down'/> : null}
          </div>
          <div className="Trash-select">
            <div className="Trash-header-left">
              <i className="Trash-header-icon icon-trash2"/>
              <div className="Trash-label">Trash</div>
            </div>
            <div className="Trash-header-count">
              { filteredTrashedFolders.length }
            </div>
          </div>
        </div>
        { isOpen ? (
          <div className="Trash-body">
            <div className="Trash-subheader">
              <div className="Trash-count">
                <div>{ filteredTrashedFolders.length }</div>
                <div>folders</div>
              </div>
              <div className="Trash-empty" onClick={this.emptyTrash}>
                Empty Trash
              </div>
            </div>
            <div className="Trash-items">
              { filteredTrashedFolders.map(trashedFolder => {
                const isDyHi = false
                const icon = isDyHi ? 'icon-foldercog' : (trashedFolder.search ? 'icon-collections-smart' : 'icon-collections-simple')
                return (
                  <div key={trashedFolder.id} className={classnames('Trash-item', {isSelected: selectedFolderIds.has(trashedFolder.folderId)})} onClick={this.selectFolder.bind(this, trashedFolder)} onContextMenu={this.showContextMenu.bind(this, trashedFolder)}>
                    { contextMenuTrashedFolderId === trashedFolder.id ? this.renderContextMenu(trashedFolder) : null }
                    <div className="flexRow flexAlignItemsCenter">
                      <i className={`Trash-item-icon ${icon}`}/>
                      <div className="Trash-label">{trashedFolder.name}</div>
                    </div>
                    <div className="Trash-item-count">
                      { this.renderPermission(trashedFolder.acl) }
                    </div>
                  </div>) }) }
            </div>
          </div>
        ) : <div/> }
      </div>
    )
  }
}

export default connect(state => ({
  trashedFolders: state.folders.trashedFolders,
  selectedFolderIds: state.folders.selectedFolderIds,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    getTrashedFolders,
    countTrashedFolders,
    emptyFolderTrash,
    deleteTrashedFolders,
    restoreTrashedFolders,
    selectFolderId
  }, dispatch)
}))(Trash)
