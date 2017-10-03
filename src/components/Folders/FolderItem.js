import React, { Component, PropTypes } from 'react'
import { DropTarget, DragSource } from '../../services/DragDrop'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Folder from '../../models/Folder'
import AclEntry from '../../models/Acl'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from './CreateExport'
import CreateFolder from './CreateFolder'
import AssetPermissions from '../AssetPermissions'
import {
  createFolder,
  addAssetIdsToFolderId,
  removeAssetIdsFromFolderId,
  deleteFolderIds,
  updateFolder,
  updateFolderPermissions,
  dropFolderId,
  createTaxonomy,
  deleteTaxonomy
} from '../../actions/folderAction'
import { showModal, hideModal, dialogAlertPromise, toggleCollapsible } from '../../actions/appActions'
import { exportAssets, getJob, markJobDownloaded } from '../../actions/jobActions'
import { restoreFolders } from '../../actions/racetrackAction'
import { setAssetPermissions } from '../../actions/assetsAction'
import { isolateSelectId } from '../../services/jsUtil'
import { FILTERED_COUNTS, FULL_COUNTS, NO_COUNTS } from './Folders'

// Renders folder children as Collapsible elements.
const folderSource = {
  dragStart (props, type, se) {
    const { folder, selectedFolderIds } = props
    const folderIds = isolateSelectId(folder.id, selectedFolderIds)
    return {folderIds}
  }
}

function dropTarget (props) {
  const { folder, dragInfo, assets, folders, user } = props
  if (!dragInfo) return false
  if (dragInfo.type === 'ASSET' && dragInfo.assetIds) {
    return folder.canAddAssetIds(dragInfo.assetIds, assets, user)
  } else if (dragInfo.type === 'FOLDER' && dragInfo.folderIds) {
    return folder.canAddChildFolderIds(dragInfo.folderIds, folders, user)
  }
  return false
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
        const parentId = dropTarget(props) ? folder.id : folder.parentId
        const parent = folders.get(parentId)
        console.log('Drop ' + JSON.stringify([...dragInfo.folderIds]) + ' on ' + props.folder.id)
        dragInfo.folderIds.forEach(folderId => {
          if (parent && parent.canAddChildFolderIds([folderId], folders, user)) {
            const folder = new Folder(props.folders.get(folderId))
            folder.parentId = parentId
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
    top: PropTypes.string,

    // state props
    selectedFolderIds: PropTypes.object,
    selectedAssetIds: PropTypes.object,
    folders: PropTypes.instanceOf(Map),
    counts: PropTypes.instanceOf(Map),
    taxonomies: PropTypes.instanceOf(Map),
    dropFolderId: PropTypes.number,
    filteredCounts: PropTypes.instanceOf(Map),
    user: PropTypes.instanceOf(User),
    origin: PropTypes.string,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    allAssetCount: PropTypes.number,
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    isManager: PropTypes.bool,
    isAdministrator: PropTypes.bool,
    uxLevel: PropTypes.number,
    actions: PropTypes.object,
    userSettings: PropTypes.object.isRequired,
    jobs: PropTypes.object
  }

  state = {
    isContextMenuVisible: false,
    contextMenuPos: { x: 0, y: 0 }
  }

  componentWillReceiveProps (nextProps) {
    // Update the drop folder id if the hover status changed to
    // avoid multiple hovered items and state change on mouse move
    if (!this.props.dragHover && nextProps.dragHover) {
      const id = dropTarget(nextProps) ? nextProps.folder.id : nextProps.folder.parentId
      if (nextProps.dropFolderId !== id) {
        this.props.actions.dropFolderId(id)
        console.log('Set drop folder id to ' + nextProps.folder.parentId)
      }
    }
  }

  showContextMenu = (event) => {
    event.preventDefault()
    this.setState({
      isContextMenuVisible: true,
      contextMenuPos: { x: event.pageX, y: event.pageY }
    })
  }

  dismissContextMenu = (event) => {
    if (event) event.preventDefault()
    this.setState({ isContextMenuVisible: false })
  }

  restoreFolder = (event) => {
    event.preventDefault()
    const { folder, actions } = this.props
    actions.restoreFolders([folder])
    this.dismissContextMenu(event)
  }

  assetPermissions = (event) => {
    event.preventDefault()
    this.dismissContextMenu(event)
    const width = '300px'
    const body = <AssetPermissions title="Folder Asset Permissions"
                                   onApply={this.setAssetPermissions}
                                   onCancel={this.props.actions.hideModal}/>
    this.props.actions.showModal({body, width})
  }

  setAssetPermissions = (acl) => {
    this.props.actions.hideModal()
    const { folder } = this.props
    const filter = new AssetFilter({links: {folder: [folder.id]}})
    const search = new AssetSearch({filter})
    this.props.actions.setAssetPermissions(search, acl)
  }

  createChild = (event) => {
    this.dismissContextMenu(event)
    const width = '300px'
    const body = <CreateFolder title='Create Collection'
                               name=""
                               acl={this.props.folder.acl} includeAssets={true}
                               includePermissions={false}
                               onCreate={this.createChildFolder}/>
    this.props.actions.showModal({body, width})
  }

  createChildFolder = (name, acl, assetIds) => {
    const parentId = this.props.folder.id
    const folder = new Folder({ name, parentId, acl })
    this.props.actions.createFolder(folder, assetIds)
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
    const { selectedFolderIds, folder } = this.props
    const folderIds = new Set(selectedFolderIds && selectedFolderIds.has(folder.id) ? [...selectedFolderIds] : [folder.id])
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
    this.props.actions.updateFolder(folder)
    if (acl && (!folder.acl || JSON.stringify(acl) !== JSON.stringify(folder.acl))) {
      folder.acl = acl
      this.props.actions.updateFolderPermissions(folder.id, acl)
    }
  }

  rename = (event) => {
    const { folder, user } = this.props
    this.dismissContextMenu(event)
    const width = '300px'
    const { timeCreated, timeModified, name } = this.props.folder
    const date = timeModified > timeCreated ? `Modified ${new Date(timeModified).toLocaleString('en-US')}` : `Created ${new Date(timeCreated).toLocaleString('en-US')}`
    const writePermission = folder.hasAccess(user, AclEntry.WriteAccess)
    const readPermission = folder.hasAccess(user, AclEntry.ReadAccess)
    const body = <CreateFolder title='Rename Folder'
                               date={date}
                               name={name}
                               includeAssets={false}
                               includePermissions={false}
                               onCreate={this.editFolder}
                               onDelete={writePermission && this.deleteFolder}
                               onLink={readPermission && this.getLink}/>
    this.props.actions.showModal({body, width})
  }

  setPermissions = (name, acl) => {
    const folderIds = new Set([...this.props.selectedFolderIds, this.props.folder.id])
    folderIds.forEach(id => {
      this.props.actions.updateFolderPermissions(id, acl)
    })
  }

  permissions = (event) => {
    this.dismissContextMenu(event)
    const width = '300px'
    const { selectedFolderIds, folder } = this.props
    let count = selectedFolderIds ? (selectedFolderIds.size + (selectedFolderIds.has(folder.id) ? 0 : 1)) : 0
    const acl = count === 1 ? folder.acl : []
    const body = <CreateFolder title='Set Permissions'
                               acl={acl}
                               includeAssets={false}
                               includePermissions={true}
                               onCreate={this.setPermissions}/>
    this.props.actions.showModal({body, width})
  }

  exportFolder = (event) => {
    this.dismissContextMenu(event)
    const width = '340px'
    const name = this.props.folder.name
    const body = <CreateExport onCreate={this.createExport} name={name}/>
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedFolderIds, metadataFields, folder, actions } = this.props
    const folderIds = selectedFolderIds.has(folder.id) ? new Set(this.props.selectedFolderIds) : [folder.id]
    const filter = new AssetFilter({links: {folder: [...folderIds]}})
    const search = new AssetSearch({filter})
    const fields = exportTable && metadataFields
    actions.toggleCollapsible('exportJobs', true)
    return actions.exportAssets(name, search, fields, exportImages)
    .then(this.waitForExportAndDownload)
  }

  // duplicate code warning: keep this in sync with ExportJobs.waitForExportAndDownload (TODO: share this code)
  waitForExportAndDownload = (exportId) => {
    const { actions } = this.props
    let timeout = 100
    return new Promise(resolve => {
      // wait until export job is done, then auto-download it
      // this code adapted from Jobs.refreshJobs()
      const waitForJob = (jobId) => {
        actions.getJob(exportId)
        .then(data => new Promise(resolve => requestAnimationFrame(_ => resolve(data)))) // wait 1 frame for getJob() data to post to global state
        .then(response => {
          // We'll watch the app state to see if our job is finished, rather
          // than checking the response from getJob()
          const job = this.props.jobs && this.props.jobs[jobId]
          if (job && job.isFinished()) {
            resolve(job)
          } else {
            timeout = Math.min(5000, timeout * 2) // try often at first, but back off for long jobs
            setTimeout(_ => waitForJob(jobId), timeout)
          }
        })
      }
      waitForJob(exportId)
    })
    .then(job => {
      const retval = window.open(job.exportStream(this.props.origin))
      if (!retval) {
        actions.dialogAlertPromise('Export complete',
          'Your export package is ready for download, using the Exports panel on the left. ' +
          'You can enable automatic downloads for future exports by allowing popus for this site.')
        return
      }
      actions.markJobDownloaded(job.id)
    })
  }

  addAssetsToFolders = () => {
    const { selectedAssetIds, actions } = this.props
    this.dismissContextMenu(event)
    this.simpleFolderIds().forEach(folderId => {
      actions.addAssetIdsToFolderId(selectedAssetIds, folderId)
    })
  }

  removeAssetsFromFolders = () => {
    const { selectedAssetIds, actions } = this.props
    this.dismissContextMenu(event)
    this.simpleFolderIds().forEach(folderId => {
      actions.removeAssetIdsFromFolderId(selectedAssetIds, folderId)
    })
  }

  createTaxonomy = (create) => {
    const {actions, folder} = this.props
    this.dismissContextMenu(event)
    actions.createTaxonomy(folder.id)
  }

  deleteTaxonomy = (create) => {
    const {actions, folder} = this.props
    this.dismissContextMenu(event)
    actions.deleteTaxonomy(folder.id)
  }

  simpleFolderIds = () => {
    const { selectedFolderIds, folder, folders } = this.props
    const simpleFolderIds = []
    if (!selectedFolderIds.has(folder.id)) {
      if (folder.isSimpleCollection()) simpleFolderIds.push(folder.id)
    } else {
      for (let id of selectedFolderIds) {
        const folder = folders.get(id)
        if (folder && folder.isSimpleCollection()) {
          simpleFolderIds.push(folder.id)
        }
      }
    }
    return simpleFolderIds
  }

  selectedAssetNotInSelectedFolder = () => {
    const { selectedAssetIds, assets } = this.props
    if (!selectedAssetIds || !selectedAssetIds.size) return false
    const simpleFolderIds = this.simpleFolderIds()
    if (!simpleFolderIds.length) return false
    for (const assetId of selectedAssetIds) {
      const index = assets.findIndex(asset => (asset.id === assetId))
      if (index < 0) continue
      const asset = assets[index]
      if (!asset.memberOfAllFolderIds(simpleFolderIds)) return true
    }
    return false
  }

  selectedFolderContainsSelectedAssets = () => {
    const { selectedAssetIds, assets } = this.props
    if (!selectedAssetIds || !selectedAssetIds.size) return false
    const simpleFolderIds = this.simpleFolderIds()
    if (!simpleFolderIds.length) return false
    for (const assetId of selectedAssetIds) {
      const index = assets.findIndex(asset => (asset.id === assetId))
      if (index < 0) continue
      const asset = assets[index]
      if (asset.memberOfAnyFolderIds(simpleFolderIds)) return true
    }
    return false
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

  // Keep the context menu from running off the bottom of the screen
  constrainContextMenu = (ctxMenu) => {
    if (!ctxMenu) return
    const { contextMenuPos } = this.state
    if (contextMenuPos.y + ctxMenu.clientHeight > window.innerHeight) {
      this.setState({ contextMenuPos: { ...contextMenuPos, y: window.innerHeight - ctxMenu.clientHeight } })
    }
  }

  renderContextMenu () {
    const { folder, selectedFolderIds, selectedAssetIds, user, isAdministrator, isManager, uxLevel } = this.props
    if (!this.state.isContextMenuVisible) {
      return
    }
    // Make sure to include this folder, even if it isn't selected
    let count = selectedFolderIds ? (selectedFolderIds.size + (selectedFolderIds.has(folder.id) ? 0 : 1)) : 0
    const singleFolderSelected = count <= 1
    const subfolderCount = this.subfolderCount(folder.id)
    const subfolderLabel = subfolderCount === 0 ? 'No subfolders' : (subfolderCount === 1 ? '1 subfolder' : `${subfolderCount} subfolders`)
    const { contextMenuPos } = this.state

    const selectedAssets = selectedAssetIds && selectedAssetIds.size > 0
    const selectedAssetsNotInFolder = selectedAssets && this.selectedAssetNotInSelectedFolder()
    const addableAssets = selectedAssetsNotInFolder && this.simpleFolderIds().length > 0
    const removableAssets = selectedAssets && this.selectedFolderContainsSelectedAssets()
    const writePermission = folder.hasAccess(user, AclEntry.WriteAccess)
    const exportPermission = folder.hasAccess(user, AclEntry.ExportAccess)
    const canAddChild = singleFolderSelected && !folder.isDyhi() && folder.isSimpleCollection() && writePermission
    let canAddChildTitle = ''
    if (!singleFolderSelected) {
      canAddChildTitle = 'Select a single folder as parent'
    } else if (folder.isDyhi()) {
      canAddChildTitle = 'Cannot add children to an automatic smart folder'
    } else if (folder.isSmartCollection()) {
      canAddChildTitle = 'Cannot add children to a smart folder'
    } else if (!writePermission) {
      canAddChildTitle = 'No write permission on parent folder'
    }
    let addableAssetTitle = 'Add selected assets to selected folders'
    if (!selectedAssets) {
      addableAssetTitle = 'No assets selected'
    } else if (!selectedAssetsNotInFolder) {
      addableAssetTitle = 'Selected assets are already in selected folder'
    } else if (!this.simpleFolderIds().length) {
      addableAssetTitle = 'No simple folders selected'
    }
    let removableAssetTitle = 'Remove selected assets from selected folders'
    if (!selectedAssets) {
      removableAssetTitle = 'No assets selected'
    } else if (!this.selectedFolderContainsSelectedAssets()) {
      removableAssetTitle = 'Selected assets are not in selected folder'
    }
    let removeFolderTitle = writePermission ? 'Move folder to trash' : 'No write permission'

    // FIXME: Get Link, Move to, and Favorite are disabled until implemented
    return (
      <div>
        <div onClick={this.dismissContextMenu} className="FolderItem-context-menu-background" onContextMenu={this.dismissContextMenu} />
        <div className="FolderItem-context-menu"
             onContextMenu={this.dismissContextMenu}
             style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
             ref={ this.constrainContextMenu }>
          { singleFolderSelected &&
          <div className="FolderItem-context-item FolderItem-context-subfolders disabled"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-folder-subfolders"/>
            <div>{subfolderLabel}</div>
          </div> }
          { singleFolderSelected && !folder.isDyhi() && (
            folder.isPrivate(user, user.permissions) ? (
              <div className="FolderItem-context-item FolderItem-context-private disabled"
                   onContextMenu={this.dismissContextMenu}>
                <div className="icon-private"/>
                <div>Private Collection</div>
              </div>
            ) : (
              <div className="FolderItem-context-item FolderItem-context-public disabled"
                   onContextMenu={this.dismissContextMenu}>
                <div className="icon-public"/>
                <div>Public Collection</div>
              </div>
            ))}
          { singleFolderSelected && writePermission &&
          <div onClick={this.rename}
               className="FolderItem-context-item FolderItem-context-edit"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-pencil"/>
            <div>Rename Folder...</div>
          </div> }
          { (isManager || isAdministrator) && uxLevel > 0 && (!singleFolderSelected || writePermission) && (
            <div onClick={this.permissions}
                 className="FolderItem-context-item FolderItem-context-edit"
                 onContextMenu={this.dismissContextMenu}>
              <div className="icon-public"/>
              <div>Folder Permissions...</div>
            </div>
          )}
          { singleFolderSelected && isAdministrator &&
          <div onClick={this.assetPermissions}
               className="FolderItem-context-item FolderItem-context-asset-permissions"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-link2"/><div>Asset Permissions...</div></div> }
          { singleFolderSelected && exportPermission &&
          <div onClick={this.exportFolder}
               className="FolderItem-context-item FolderItem-context-export"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-export"/>
            <div>Export Assets</div>
          </div> }
          { singleFolderSelected && !folder.isDyhi() && folder.isSmartCollection() &&
          <div onClick={this.restoreFolder}
               className="FolderItem-context-item FolderItem-context-restore-widgets"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-settings_backup_restore"/><div>Restore Widgets</div></div> }
          { singleFolderSelected && !folder.isDyhi() && folder.isSimpleCollection() && writePermission &&
            <div onClick={canAddChild && this.createChild}
                 className="FolderItem-context-item FolderItem-context-create-subfolder"
                 onContextMenu={this.dismissContextMenu}>
              <div title={canAddChildTitle}
                   className={classnames('icon-folder-add', {disabled: !canAddChild})} />
              <div>Create Sub-folder</div>
            </div> }
          { singleFolderSelected && folder.taxonomyRoot && isAdministrator &&
            <div onClick={this.deleteTaxonomy}
                 title="Delete taxonomy to remove folder keywords"
                 className="FolderItem-context-item FolderItem-context-taxonomy"
                 onContextMenu={this.dismissContextMenu}>
              <div className="icon-site-map"/>
              <div>Delete Taxonomy</div>
            </div>
          }
          { singleFolderSelected && !folder.taxonomyRoot && isAdministrator &&
          <div onClick={this.createTaxonomy}
               title="Create taxonomy to add keywords for this folder"
               className="FolderItem-context-item FolderItem-context-taxonomy"
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-site-map"/>
            <div>Create Taxonomy</div>
          </div>
          }
          <div onClick={addableAssets && this.addAssetsToFolders}
               title={addableAssetTitle}
               className={classnames('FolderItem-context-item FolderItem-context-add-assets', {disabled: !addableAssets})}>
            <div className="icon-plus"/>
            <div>Add Assets</div>
          </div>
          <div onClick={removableAssets && this.removeAssetsFromFolders}
               title={removableAssetTitle}
               className={classnames('FolderItem-context-item FolderItem-context-remove-assets', {disabled: !removableAssets})}>
            <div className="icon-removeasset"/>
            <div>Remove Assets</div>
          </div>
          <div onClick={writePermission && this.removeFolder}
               title={removeFolderTitle}
               className={classnames('FolderItem-context-item FolderItem-context-remove-folder', {disabled: !writePermission})}
               onContextMenu={this.dismissContextMenu}>
            <div className="icon-trash2"/>
            <div>Trash Folder</div>
          </div>
        </div>
      </div>
    )
  }

  renderCount () {
    const { folder, counts, allAssetCount, filteredCounts, userSettings } = this.props
    let count = counts && counts.get(folder.id)
    let filteredCount = filteredCounts && filteredCounts.get(folder.id)
    if (allAssetCount) {
      if (count === allAssetCount) count = 'all'
      if (filteredCount === allAssetCount) filteredCount = 'all'
    }
    if (count === undefined) return <div/>
    if (count === filteredCount) return <div className="FolderItem-count">{count}</div>
    switch (userSettings.showFolderCounts) {
      case NO_COUNTS: return <div/>
      case FULL_COUNTS: return <div className="FolderItem-count">{count}</div>
      case FILTERED_COUNTS:
      default:
        return (
          <div className="FolderItem-counts">
            <div className={classnames('FolderItem-filtered-count', {isZero: filteredCount === 0})}>{filteredCount}</div>
            { filteredCount !== undefined && <div>/</div> }
            <div className="FolderItem-count">{count}</div>
          </div>
        )
    }
  }

  renderPermission () {
    const { folder, user } = this.props
    const permisionIcon = folder.isPublic(user, user.permissions) ? 'icon-public' : undefined
    if (folder.isPublic(user, user.permissions)) {
      return <div className={classnames('FolderItem-permission', permisionIcon)}/>
    }
  }

  render () {
    const { folder, depth, isOpen, hasChildren, isSelected, onToggle, onSelect, dropparams, dropFolderId, top } = this.props
    const dragHover = this.props.dragHover || dropFolderId === folder.id
    const icon = folder.isDyhi() ? 'icon-foldercog' : (folder.isSmartCollection() ? 'icon-collections-smart' : 'icon-collections-simple')
    const draggable = !folder.isDyhi() || folder.dyhiRoot
    const isDropTarget = dropTarget(this.props)
    const dragparams = { ...this.props.dragparams, draggable }  // disable drag
    return (
      <div className={classnames('FolderItem', { isOpen, hasChildren, isSelected, isDropTarget: dropTarget(this.props), dragHover })}
           style={{ paddingLeft: `${(depth - 1) * 10}px`, top }}>
        { this.renderContextMenu() }
        <div className={classnames('FolderItem-toggle', {hasChildren})}
             onClick={event => { onToggle(folder); return false }}>
          {hasChildren ? <i className='FolderItem-toggleArrow icon-triangle-down'/> : null}
        </div>
        <div className={classnames('FolderItem-select')} {...dragparams}
             onClick={event => onSelect(event, folder)}
             onContextMenu={this.showContextMenu}>
          <div className="flexRow flexAlignItemsCenter">
            <i className={`FolderItem-icon ${icon}`}/>
            <div className='FolderItem-text' key={folder.id}>
              {folder.name}
            </div>
          </div>
          <div className="flexRow flexAlignItemsCenter">
            { this.renderPermission() }
            { folder.taxonomyRoot && <div className="FolderItem-taxonomy icon-site-map" title="Taxonomy adds folder name to keywords"/> }
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
  allAssetCount: state.assets.allAssetCount,
  folders: state.folders.all,
  counts: state.folders.counts,
  filteredCounts: state.folders.filteredCounts,
  taxonomies: state.folders.taxonomies,
  selectedFolderIds: state.folders.selectedFolderIds,
  selectedAssetIds: state.assets.selectedIds,
  dropFolderId: state.folders.dropFolderId,
  user: state.auth.user,
  origin: state.auth.origin,
  dragInfo: state.app.dragInfo,
  metadataFields: state.app.metadataFields,
  isManager: state.auth.isManager,
  isAdministrator: state.auth.isAdministrator,
  uxLevel: state.app.uxLevel,
  userSettings: state.app.userSettings,
  jobs: state.jobs.all
}), dispatch => ({
  actions: bindActionCreators({
    createFolder,
    addAssetIdsToFolderId,
    removeAssetIdsFromFolderId,
    dropFolderId,
    exportAssets,
    getJob,
    markJobDownloaded,
    showModal,
    hideModal,
    dialogAlertPromise,
    deleteFolderIds,
    updateFolder,
    updateFolderPermissions,
    restoreFolders,
    setAssetPermissions,
    createTaxonomy,
    deleteTaxonomy,
    toggleCollapsible
  }, dispatch)
}))(FolderItem)
