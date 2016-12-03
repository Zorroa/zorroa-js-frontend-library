import React, { Component, PropTypes } from 'react'
import { DropTarget } from '../../services/DragDrop'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import User from '../../models/User'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from './CreateExport'
import { addAssetIdsToFolderId, deleteFolderIds, updateFolder } from '../../actions/folderAction'
import { showModal, showCreateFolderModal } from '../../actions/appActions'
import { exportAssets } from '../../actions/jobActions'

// Renders folder children as Collapsible elements.

const target = {
  dragOver (props, type, se) {
    se.preventDefault()
  },
  drop (props, type, se) {
    se.preventDefault()
    // allows us to match drop targets to drag sources
    const dataStr = se.dataTransfer.getData('text/plain')
    const data = JSON.parse(dataStr) //
    if (data && data.type === type) {
      console.log('Drop ' + props.selectedAssetIds + ' on ' + props.folder.id)
      // Make sure the asset being dragged is added, even if it isn't selected
      var selectedAssetIds = new Set(props.selectedAssetIds)
      selectedAssetIds.add(data.id)
      props.actions.addAssetIdsToFolderId(selectedAssetIds, props.folder.id)
    }
  }
}

@DropTarget('FOLDER', target)
class FolderItem extends Component {
  static propTypes = {
    // input props
    folder: PropTypes.instanceOf(Folder).isRequired,
    depth: PropTypes.number.isRequired,
    dropparams: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    hasChildren: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onToggle: PropTypes.func,
    onSelect: PropTypes.func,
    dragHover: PropTypes.bool.isRequired,

    // state props
    selectedFolderIds: PropTypes.object,
    folders: PropTypes.arrayOf(PropTypes.instanceOf(Folder)),
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object
  }

  state = { isContextMenuVisible: false }

  showContextMenu = (event) => {
    event.preventDefault()
    this.setState({ isContextMenuVisible: true })
  }

  dismissContextMenu = (event) => {
    if (event) event.preventDefault()
    this.setState({ isContextMenuVisible: false })
  }

  getLink = (event) => {
    console.log('Get link to folder')
    this.dismissContextMenu(event)
  }

  moveTo = (event) => {
    console.log('Move folder to...')
    this.dismissContextMenu(event)
  }

  favorite = (event) => {
    console.log('Favorite folder')
    this.dismissContextMenu(event)
  }

  removeFolder = (event) => {
    const folderIds = new Set(this.props.selectedFolderIds)
    folderIds.add(this.props.folder.id)
    this.props.actions.deleteFolderIds(folderIds)
    this.dismissContextMenu(event)
  }

  deleteFolder = () => {
    const folderIds = new Set([this.props.folder.id])
    this.props.actions.deleteFolderIds(folderIds)
  }

  editFolder = (name, acl) => {
    const folder = new Folder(this.props.folder)
    folder.name = name
    folder.acl = acl
    this.props.actions.updateFolder(folder)
  }

  edit = (event) => {
    this.dismissContextMenu(event)
    this.props.actions.showCreateFolderModal('Edit Collection', this.props.folder.acl,
      this.editFolder, this.props.folder.name, this.deleteFolder, this.getLink)
  }

  exportFolder = (event) => {
    const width = '340px'
    const body = <CreateExport onCreate={this.createExport}/>
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedFolderIds } = this.props
    const filter = new AssetFilter({links: {folder: [...selectedFolderIds]}})
    const search = new AssetSearch({filter})
    this.props.actions.exportAssets(name, search)
  }

  // Count direct folder descendents, which is known, unlike recursive,
  // which only includes folders that have been opened and thier children
  subfolderCount (folderId) {
    const { folders } = this.props
    let count = 0
    folders.forEach(folder => {
      count += folder.parentId === folderId ? 1 : 0
    })
    return count
  }

  renderContextMenu () {
    const { folder, selectedFolderIds } = this.props
    if (!this.state.isContextMenuVisible) {
      return
    }
    // Make sure to include this folder, even if it isn't selected
    let count = selectedFolderIds ? (selectedFolderIds.size + (selectedFolderIds.has(folder.id) ? 0 : 1)) : 0
    const singleFolderSelected = count <= 1
    const subfolderCount = this.subfolderCount(folder.id)
    const subfolderLabel = subfolderCount === 0 ? 'No subfolders' : (subfolderCount === 1 ? '1 subfolder' : `${subfolderCount} subfolders`)
    // FIXME: Get Link, Move to, and Favorite are disabled until implemented
    return (
      <div>
        <div onClick={this.dismissContextMenu} className="FolderItem-context-menu-background" onContextMenu={this.dismissContextMenu} />
        <div className="FolderItem-context-menu" onContextMenu={this.dismissContextMenu}>
          { singleFolderSelected && <div className="FolderItem-context-item disabled" onContextMenu={this.dismissContextMenu}><div className="icon-folder-subfolders"/><div>{subfolderLabel}</div></div> }
          { singleFolderSelected && <div onClick={this.getLink} className="FolderItem-context-item disabled" onContextMenu={this.dismissContextMenu}><div className="icon-link2"/><div>Get link</div></div> }
          { singleFolderSelected && <div onClick={this.exportFolder} className="FolderItem-context-item" onContextMenu={this.dismissContextMenu}><div className="icon-download2"/><div>Export folder</div></div> }
          <div onClick={this.moveTo} className="FolderItem-context-item disabled" onContextMenu={this.dismissContextMenu}><div className="icon-folder-move"/><div>Move to...</div></div>
          <div onClick={this.favorite} className="FolderItem-context-item disabled" onContextMenu={this.dismissContextMenu}><div className="icon-star-empty"/><div>Favorite</div></div>
          { singleFolderSelected && <div onClick={this.edit} className="FolderItem-context-item" onContextMenu={this.dismissContextMenu}><div className="icon-pencil"/><div>Edit...</div></div> }
          <div onClick={this.removeFolder} className="FolderItem-context-item" onContextMenu={this.dismissContextMenu}><div className="icon-trash2"/><div>Remove folder</div></div>
        </div>
      </div>
    )
  }

  render () {
    const { folder, depth, isOpen, hasChildren, isSelected, onToggle, onSelect, dropparams, dragHover, user } = this.props
    const icon = folder.isDyhi() ? 'icon-foldercog' : (folder.search ? 'icon-collections-smart' : 'icon-collections-simple')
    const isDropTarget = folder.isDropTarget(user)
    return (
      <div className={classnames('FolderItem', { isOpen, hasChildren, isSelected, isDropTarget, dragHover })}
           style={{ paddingLeft: `${(depth - 1) * 10}px` }}>
        { this.renderContextMenu() }
        <div className='FolderItem-toggle'
             onClick={event => { onToggle(folder); return false }}>
          {(hasChildren) ? <i className='FolderItem-toggleArrow icon-triangle-down'/> : null}
        </div>
        <div className={classnames('FolderItem-select')}
             onClick={event => { onSelect(event, folder); return false }}
             onContextMenu={this.showContextMenu}>
          <i className={`FolderItem-icon ${icon}`}/>
          <div className='FolderItem-text' key={folder.id}>
            {folder.name}
          </div>
        </div>
        <div className={classnames('FolderItem-dropzone', {isDropTarget, dragHover})} {...dropparams}/>
      </div>
    )
  }
}

export default connect(state => ({
  selectedAssetIds: state.assets.selectedIds,
  folders: state.folders.all,
  selectedFolderIds: state.folders.selectedFolderIds,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    addAssetIdsToFolderId,
    exportAssets,
    showModal,
    showCreateFolderModal,
    deleteFolderIds,
    updateFolder
  }, dispatch)
}))(FolderItem)
