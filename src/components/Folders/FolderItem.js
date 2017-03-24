import React, { Component, PropTypes } from 'react'
import { DropTarget, DragSource } from '../../services/DragDrop'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from './CreateExport'
import CreateFolder from './CreateFolder'
import {
  selectFolderIds,
  addAssetIdsToFolderId,
  deleteFolderIds,
  updateFolder } from '../../actions/folderAction'
import { showModal } from '../../actions/appActions'
import { exportAssets } from '../../actions/jobActions'
import { restoreSearch } from '../../actions/racetrackAction'
import { isolateSelectId } from '../../services/jsUtil'

// Renders folder children as Collapsible elements.
const folderSource = {
  dragStart (props, type, se) {
    const { folder, selectedFolderIds } = props
    const folderIds = isolateSelectId(folder.id, selectedFolderIds)
    return {folderIds}
  }
}

const target = {
  drop (props, se) {
    const { dragInfo, folder, folders, user } = props
    if (!dragInfo) return
    switch (dragInfo.type) {
      case 'ASSET':
        console.log('Drop ' + JSON.stringify([...dragInfo.assetIds]) + ' on ' + props.folder.id)
        props.actions.addAssetIdsToFolderId(dragInfo.assetIds, props.folder.id)
        break
      case 'FOLDER':
        console.log('Drop ' + JSON.stringify([...dragInfo.folderIds]) + ' on ' + props.folder.id)
        dragInfo.folderIds.forEach(folderId => {
          if (folder.canAddChildFolderIds([folderId], folders, user)) {
            const folder = new Folder(props.folders.get(folderId))
            folder.parentId = props.folder.id
            props.actions.updateFolder(folder)
          }
        })
        break
    }
  }
}

@DragSource('FOLDER', folderSource)
@DropTarget(target)
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
    dragHover: PropTypes.bool,
    dragparams: PropTypes.object,
    dragInfo: PropTypes.object,

    // state props
    selectedFolderIds: PropTypes.object,
    folders: PropTypes.instanceOf(Map),
    counts: PropTypes.instanceOf(Map),
    filteredCounts: PropTypes.instanceOf(Map),
    user: PropTypes.instanceOf(User),
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.object
  }

  state = {
    isContextMenuVisible: false,
    contextMenuPos: { x: 0, y: 0 }
  }

  showContextMenu = (event) => {
    event.preventDefault()

    // Isolate-select if the clicked folder is not selected
    const { folder, selectedFolderIds, onSelect } = this.props
    if (!selectedFolderIds.has(folder.id)) {
      onSelect({shiftKey: false, metaKey: false}, folder)
    }
    this.setState({
      isContextMenuVisible: true,
      contextMenuPos: { x: event.pageX, y: event.pageY }
    })
  }

  dismissContextMenu = (event) => {
    if (event) event.preventDefault()
    this.setState({ isContextMenuVisible: false })
  }

  restoreSearch = (event) => {
    event.preventDefault()
    const { folder, actions } = this.props
    actions.restoreSearch(folder.search)
    let folders = []
    if (folder.search && folder.search.filter &&
      folder.search.filter.links && folder.search.filter.links.folder) {
      folders = folder.search.filter.links.folder
    }
    actions.selectFolderIds(folders)
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
    const width = '300px'
    const { acl, timeCreated, timeModified, name } = this.props.folder
    const date = timeModified > timeCreated ? `Modified ${new Date(timeModified).toLocaleString('en-US')}` : `Created ${new Date(timeCreated).toLocaleString('en-US')}`
    const body = <CreateFolder title='Edit Collection'
                               acl={acl}
                               date={date}
                               name={name}
                               onCreate={this.editFolder}
                               onDelete={this.deleteFolder}
                               onLink={this.getLink}/>
    this.props.actions.showModal({body, width})
  }

  exportFolder = (event) => {
    const width = '340px'
    const body = <CreateExport onCreate={this.createExport}/>
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedFolderIds, metadataFields } = this.props
    const filter = new AssetFilter({links: {folder: [...selectedFolderIds]}})
    const search = new AssetSearch({filter})
    const fields = exportTable && metadataFields
    this.props.actions.exportAssets(name, search, fields, exportImages)
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

  isDropTarget () {
    const { folder, dragInfo, assets, folders, user } = this.props
    if (!dragInfo) return false
    if (dragInfo.type === 'ASSET' && dragInfo.assetIds) {
      return folder.canAddAssetIds(dragInfo.assetIds, assets, user)
    } else if (dragInfo.type === 'FOLDER' && dragInfo.folderIds) {
      return folder.canAddChildFolderIds(dragInfo.folderIds, folders, user)
    }
    return false
  }

  // Keep the context menu from running off the bottom of the screen
  constrainContextMenu = (ctxMenu) => {
    if (!ctxMenu) return
    const { contextMenuPos } = this.state
    if (contextMenuPos.y + ctxMenu.clientHeight > window.innerHeight) {
      this.setState({ contextMenuPos: { ...contextMenuPos, y: window.innerHeight - ctxMenu.clientHeight } })
    }
  }

  renderContextMenu () {
    const { folder, selectedFolderIds, user } = this.props
    if (!this.state.isContextMenuVisible) {
      return
    }
    // Make sure to include this folder, even if it isn't selected
    let count = selectedFolderIds ? (selectedFolderIds.size + (selectedFolderIds.has(folder.id) ? 0 : 1)) : 0
    const singleFolderSelected = count <= 1
    const subfolderCount = this.subfolderCount(folder.id)
    const subfolderLabel = subfolderCount === 0 ? 'No subfolders' : (subfolderCount === 1 ? '1 subfolder' : `${subfolderCount} subfolders`)
    const { contextMenuPos } = this.state
    // FIXME: Get Link, Move to, and Favorite are disabled until implemented
    return (
      <div>
        <div onClick={this.dismissContextMenu} className="FolderItem-context-menu-background" onContextMenu={this.dismissContextMenu} />
        <div className="FolderItem-context-menu"
             onContextMenu={this.dismissContextMenu}
             style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
             ref={ this.constrainContextMenu }>
          { singleFolderSelected &&
          <div className="FolderItem-context-item disabled"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-folder-subfolders"/>
            <div>{subfolderLabel}</div>
          </div> }
          { singleFolderSelected && !folder.isDyhi() && (
            folder.isPrivate(user, user.permissions) ? (
              <div className="FolderItem-context-item disabled"
                   onContextMenu={this.dismissContextMenu}>
                <div className="icon-private"/>
                <div>Private Collection</div>
              </div>
            ) : (
              <div className="FolderItem-context-item disabled"
                   onContextMenu={this.dismissContextMenu}>
                <div className="icon-public"/>
                <div>Public Collection</div>
              </div>
            ))}
          { singleFolderSelected && !folder.isDyhi() && folder.search &&
          <div onClick={this.restoreSearch}
               className="FolderItem-context-item FolderItem-context-restore-widgets"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-settings_backup_restore"/><div>Restore Widgets</div></div> }
          { singleFolderSelected &&
          <div onClick={this.exportFolder}
               className="FolderItem-context-item"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-export"/>
            <div>Export folder</div>
          </div> }
          <div onClick={this.moveTo}
               className="FolderItem-context-item disabled"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-folder-move"/>
            <div>Move to...</div>
          </div>
          <div onClick={this.favorite}
               className="FolderItem-context-item disabled"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-star-empty"/>
            <div>Favorite</div>
          </div>
          { singleFolderSelected &&
          <div onClick={this.edit}
               className="FolderItem-context-item FolderItem-context-edit"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-pencil"/>
            <div>Edit...</div>
          </div> }
          <div onClick={this.removeFolder}
               className="FolderItem-context-item FolderItem-context-remove-folder"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-trash2"/>
            <div>Remove folder</div>
          </div>
        </div>
      </div>
    )
  }

  renderCount () {
    const { folder, counts, filteredCounts } = this.props
    const count = counts && counts.get(folder.id)
    const filteredCount = filteredCounts && filteredCounts.get(folder.id)
    if (count === undefined) return <div/>
    if (filteredCount === undefined || count === filteredCount) {
      return <div className="FolderItem-count">{count}</div>
    }
    const isZero = filteredCount === 0
    return (
      <div className="FolderItem-counts">
        <div className={classnames('FolderItem-filtered-count', {isZero})}>{filteredCount}</div>
        /
        <div className="FolderItem-count">{count}</div>
      </div>
    )
  }

  renderPermission () {
    const { folder, user } = this.props
    const permisionIcon = folder.isPublic(user, user.permissions) ? 'icon-public' : undefined
    if (folder.isPublic(user, user.permissions)) {
      return <div className={classnames('FolderItem-permission', permisionIcon)}/>
    }
  }

  render () {
    const { folder, depth, isOpen, hasChildren, isSelected, onToggle, onSelect, dropparams, dragHover } = this.props
    const icon = folder.isDyhi() ? 'icon-foldercog' : (folder.search ? 'icon-collections-smart' : 'icon-collections-simple')
    const draggable = !folder.isDyhi()
    const isDropTarget = this.isDropTarget()
    const dragparams = { ...this.props.dragparams, draggable }  // disable drag
    return (
      <div className={classnames('FolderItem', { isOpen, hasChildren, isSelected, isDropTarget, dragHover })}
           style={{ paddingLeft: `${(depth - 1) * 10}px` }}>
        { this.renderContextMenu() }
        <div className={classnames('FolderItem-toggle', {hasChildren})}
             onClick={event => { onToggle(folder); return false }}>
          {hasChildren ? <i className='FolderItem-toggleArrow icon-triangle-down'/> : null}
        </div>
        <div className={classnames('FolderItem-select')} {...dragparams}
             onClick={event => { onSelect(event, folder); return false }}
             onContextMenu={this.showContextMenu}>
          <div className="flexRow flexAlignItemsCenter">
            <i className={`FolderItem-icon ${icon}`}/>
            <div className='FolderItem-text' key={folder.id}>
              {folder.name}
            </div>
          </div>
          <div className="flexRow flexAlignItemsCenter">
            { this.renderPermission() }
            { this.renderCount() }
          </div>
        </div>
        <div className={classnames('FolderItem-dropzone', {isDropTarget, dragHover})} {...dropparams}/>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  folders: state.folders.all,
  counts: state.folders.counts,
  filteredCounts: state.folders.filteredCounts,
  selectedFolderIds: state.folders.selectedFolderIds,
  user: state.auth.user,
  dragInfo: state.app.dragInfo,
  metadataFields: state.app.metadataFields
}), dispatch => ({
  actions: bindActionCreators({
    selectFolderIds,
    addAssetIdsToFolderId,
    exportAssets,
    showModal,
    deleteFolderIds,
    updateFolder,
    restoreSearch
  }, dispatch)
}))(FolderItem)
