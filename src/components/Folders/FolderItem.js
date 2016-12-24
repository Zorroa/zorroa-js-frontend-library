import React, { Component, PropTypes } from 'react'
import { DropTarget, DragSource } from '../../services/DragDrop'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import User from '../../models/User'
import Folder, { isDroppable } from '../../models/Folder'
import Permission from '../../models/Permission'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from './CreateExport'
import { addAssetIdsToFolderId, deleteFolderIds, updateFolder } from '../../actions/folderAction'
import { showModal, showCreateFolderModal } from '../../actions/appActions'
import { exportAssets } from '../../actions/jobActions'
import { restoreSearch } from '../../actions/racetrackAction'

// Renders folder children as Collapsible elements.
const folderSource = {
  dragStart (props, type, se) {
    // Isolate unselected, or retain multiple selection for drag source,
    // with special care to get the new selected set prior to state update.
    // Using props.selectedFolderIds here misses the newly selected item,
    // but using props.selectedFolderIds in the drop event usually works,
    // though technically as a hard-to-hit race. Using the returned set
    // always works and allow drops on items without props.selectedFolderIds
    const selectedFolderIds = isolateSelect(props)
    se.dataTransfer.setData('text/plain', JSON.stringify({type, folderIds: [...selectedFolderIds]}))
  },
  dragEnd (props, type, se) {
    se.preventDefault()
  }
}

const target = {
  dragOver (props, type, se) {
    se.preventDefault()
  },
  drop (props, type, se) {
    se.preventDefault()
    // allows us to match drop targets to drag sources
    const dataStr = se.dataTransfer.getData('text/plain')
    const data = JSON.parse(dataStr)
    if (!data) return
    switch (data.type) {
      case 'ASSET':
        console.log('Drop ' + props.selectedAssetIds + ' on ' + props.folder.id)
        // Make sure the asset being dragged is added, even if it isn't selected
        var selectedAssetIds = new Set(props.selectedAssetIds)
        selectedAssetIds.add(data.id)
        props.actions.addAssetIdsToFolderId(selectedAssetIds, props.folder.id)
        break
      case 'FOLDER':
        // Drop the current selected folder set, either from the special
        // isolateSelect return in dragStart or from props.selectedFolderIds
        console.log('Drop ' + JSON.stringify([...data.folderIds]) + ' on ' + props.folder.id)
        data.folderIds.forEach(folderId => {
          if (isDroppable(props)) {
            const folder = new Folder(props.folders.get(folderId))
            folder.parentId = props.folder.id
            props.actions.updateFolder(folder)
          }
        })
        break
    }
  }
}

function isolateSelect (props) {
  // Isolate-select if the clicked folder is not selected
  const { folder, selectedFolderIds, onSelect } = props
  if (!selectedFolderIds.has(folder.id)) {
    const action = onSelect({shiftKey: false, metaKey: false}, folder)
    return action.payload
  }
  return selectedFolderIds
}

@DragSource('FOLDER', folderSource)
@DropTarget('ASSET', target)
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
    dragparams: PropTypes.object,

    // state props
    selectedFolderIds: PropTypes.object,
    folders: PropTypes.arrayOf(PropTypes.instanceOf(Folder)),
    counts: PropTypes.instanceOf(Map),
    filteredCounts: PropTypes.instanceOf(Map),
    user: PropTypes.instanceOf(User),
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object
  }

  state = { isContextMenuVisible: false }

  showContextMenu = (event) => {
    event.preventDefault()
    isolateSelect(this.props)
    this.setState({ isContextMenuVisible: true })
  }

  dismissContextMenu = (event) => {
    if (event) event.preventDefault()
    this.setState({ isContextMenuVisible: false })
  }

  restoreSearch = (event) => {
    event.preventDefault()
    const { folder, actions } = this.props
    actions.restoreSearch(folder.search)
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
    const { folder, selectedFolderIds, user } = this.props
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
               className="FolderItem-context-item"
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
               className="FolderItem-context-item"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-pencil"/>
            <div>Edit...</div>
          </div> }
          <div onClick={this.removeFolder}
               className="FolderItem-context-item"
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
    const isDropTarget = isDroppable(this.props)
    const dragparams = { ...this.props.dragparams, draggable }  // disable drag
    return (
      <div className={classnames('FolderItem', { isOpen, hasChildren, isSelected, isDropTarget, dragHover })}
           style={{ paddingLeft: `${(depth - 1) * 10}px` }}>
        { this.renderContextMenu() }
        <div className={classnames('FolderItem-toggle', {hasChildren})}
             onClick={event => { onToggle(folder); return false }}>
          {(hasChildren) ? <i className='FolderItem-toggleArrow icon-triangle-down'/> : null}
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
  selectedAssetIds: state.assets.selectedIds,
  folders: state.folders.all,
  counts: state.folders.counts,
  filteredCounts: state.folders.filteredCounts,
  selectedFolderIds: state.folders.selectedFolderIds,
  user: state.auth.user,
  permissions: state.permissions.all
}), dispatch => ({
  actions: bindActionCreators({
    addAssetIdsToFolderId,
    exportAssets,
    showModal,
    showCreateFolderModal,
    deleteFolderIds,
    updateFolder,
    restoreSearch
  }, dispatch)
}))(FolderItem)
