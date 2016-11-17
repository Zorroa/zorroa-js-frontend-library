import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'

import Folder from '../../models/Folder'
import { getFolderChildren, createFolder, deleteFolderIds, selectFolderIds, toggleFolder } from '../../actions/folderAction'
import FolderItem from './FolderItem'
import CreateFolder from './CreateFolder'

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
class Folders extends Component {
  static propTypes = {
    // input props
    filterName: PropTypes.string.isRequired,

    // connect props
    actions: PropTypes.object.isRequired,

    // state props
    folders: PropTypes.object.isRequired
  }

  state = { showCreateFolder: false }

  componentWillMount () {
    assert.ok(this.props.filterName in Folder.Filters) // make sure filter is valid

    const rootFolder = this.props.folders.all.get(Folder.ROOT_ID)
    if (!rootFolder.childIds || !rootFolder.childIds.size) {
      this.loadChildren(Folder.ROOT_ID)
    }
  }

  loadChildren (id) {
    const { folders } = this.props
    var maybeLoadGrandchildren = (children) => {
      // If I've never loaded these children before, do it once now
      // This is to find out whether the children have children, so we can
      // show or hide UI for toggling folders
      if (children) children.forEach(child => {
        // only load child's children if we haven't loaded this child before
        if (!folders.all.get(child.id)) {
          this.props.actions.getFolderChildren(child.id)
        }
      })
    }
    this.props.actions.getFolderChildren(id, maybeLoadGrandchildren)
  }

  deleteFolder = () => {
    this.props.actions.deleteFolderIds(this.props.folders.selectedFolderIds)
  }

  toggleFolder = (folder) => {
    const { folders } = this.props
    const isOpen = folders.openFolderIds.has(folder.id)
    const doOpen = !isOpen
    this.props.actions.toggleFolder(folder.id, doOpen)
    if (doOpen) this.loadChildren(folder.id)
  }

  selectFolder (folder) {
    console.log('selectFolder')
    const selectedFolderIds = new Set(this.props.folders.selectedFolderIds)
    selectedFolderIds[ selectedFolderIds.has(folder.id) ? 'delete' : 'add' ](folder.id)
    this.props.actions.selectFolderIds(selectedFolderIds)
  }

  getFolderList (folder, depth) {
    const { folders } = this.props
    const isOpen = folders.openFolderIds.has(folder.id)
    const isSelected = folders.selectedFolderIds.has(folder.id)
    const childIds = folder.childIds

    // Show this folder, except for root, we don't need to see root
    let folderList = (depth > 0) ? [
      (<FolderItem {...{depth, folder, isOpen, isSelected}}
        key={folder.id}
        hasChildren={!childIds || childIds.size > 0 /* pretend there are children when we have no information */}
        onToggle={this.toggleFolder.bind(this, folder)}
        onSelect={this.selectFolder.bind(this, folder)}
      />)
    ] : []

    if (childIds && isOpen) {
      let children = []
      childIds.forEach(childId => children.push(this.props.folders.all.get(childId)))
      // Filter the tree at the root by the filter type passed in from Workspace
      if (depth === 0) {
        children = children.filter(Folder.Filters[this.props.filterName])
      }
      children.forEach(child => {
        folderList = folderList.concat(this.getFolderList(child, depth + 1))
      })
    }

    return folderList
  }

  addFolder = () => {
    this.setState({ ...this.state, showCreateFolder: true })
  }

  dismissCreateFolder = () => {
    this.setState({ ...this.state, showCreateFolder: false })
  }

  createFolder = (name, acl) => {
    const selectedFolderIds = this.props.folders.selectedFolderIds
    assert.ok(selectedFolderIds && selectedFolderIds.size === 1)
    const parentId = selectedFolderIds.values().next().value
    const folder = new Folder({ name, parentId, acl })
    this.props.actions.createFolder(folder)
    this.dismissCreateFolder()
  }

  render () {
    const { folders } = this.props
    const { showCreateFolder } = this.state
    const selectedFolderIds = folders.selectedFolderIds
    const rootLoaded = folders.all.has(Folder.ROOT_ID)
    if (!rootLoaded) return null
    const isFolderSelected = selectedFolderIds && selectedFolderIds.size > 0
    const isDisabled = !selectedFolderIds || selectedFolderIds.size !== 1
    const rootFolder = folders.all.get(Folder.ROOT_ID)
    let folderList = this.getFolderList(rootFolder, 0)

    return (
      <div className='Folders'>
        <div className="Folders-controls">
          <button disabled={isDisabled} onClick={this.addFolder}>
            <span className="icon-plus-square"/>&nbsp;New Folder
          </button>
          { showCreateFolder && <CreateFolder title="Create Simple Collection" onDismiss={this.dismissCreateFolder} onCreate={this.createFolder} /> }
          <button disabled={!isFolderSelected} onClick={this.deleteFolder}>
            <span className="icon-trash2"/>&nbsp;Delete
          </button>
        </div>
        <div>
          {folderList}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  folders: state.folders
}), dispatch => ({
  actions: bindActionCreators({ getFolderChildren, createFolder, deleteFolderIds, selectFolderIds, toggleFolder }, dispatch)
}))(Folders)
