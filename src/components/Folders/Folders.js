import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'

import Folder from '../../models/Folder'
import { getFolderChildren, deleteFolderIds, selectFolderIds, toggleFolder } from '../../actions/folderAction'
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

  componentWillMount () {
    assert.ok(this.props.filterName in Folder.Filters) // make sure filter is valid

    this.loadChildren(Folder.ROOT_ID)
  }

  loadChildren (id) {
    this.props.actions.getFolderChildren(id)
  }

  deleteFolder = () => {
    this.props.actions.deleteFolderIds(this.props.folders.selectedFolderIds)
  }

  toggleFolder = (folder) => {
    const isOpen = this.props.folders.openFolderIds.has(folder.id)
    this.props.actions.toggleFolder(folder.id, !isOpen)
    this.loadChildren(folder.id)
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

  render () {
    const { folders } = this.props
    const selectedFolderIds = folders.selectedFolderIds
    const rootLoaded = folders.all.has(Folder.ROOT_ID)
    if (!rootLoaded) return null
    const isFolderSelected = selectedFolderIds && selectedFolderIds.size > 0
    const parentId = (selectedFolderIds && selectedFolderIds.size === 1)
      ? selectedFolderIds.values().next().value
      : null

    const rootFolder = folders.all.get(Folder.ROOT_ID)
    let folderList = this.getFolderList(rootFolder, 0)

    return (
      <div className='Folders'>
        <div className="Folders-controls">
          <CreateFolder parentId={parentId}/>
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
  actions: bindActionCreators({ getFolderChildren, deleteFolderIds, selectFolderIds, toggleFolder }, dispatch)
}))(Folders)
