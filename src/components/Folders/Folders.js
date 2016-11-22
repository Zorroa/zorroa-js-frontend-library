import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'

import Folder from '../../models/Folder'
import { getFolderChildren, createFolder, selectFolderIds, toggleFolder } from '../../actions/folderAction'
import { showCreateFolderModal } from '../../actions/appActions'
import FolderItem from './FolderItem'
import AssetSearch from '../../models/AssetSearch'

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
class Folders extends Component {
  static propTypes = {
    // input props
    filterName: PropTypes.string.isRequired,

    // connect props
    actions: PropTypes.object.isRequired,

    // state props
    folders: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch)
  }

  state = { filterString: '' }

  componentWillMount () {
    assert.ok(this.props.filterName in Folder.Filters) // make sure filter is valid

    const rootFolder = this.props.folders.all.get(Folder.ROOT_ID)
    if (!rootFolder.childIds || !rootFolder.childIds.size) {
      this.loadChildren(Folder.ROOT_ID)
    }
  }

  loadChildren (id) {
    const { folders } = this.props

    this.props.actions.getFolderChildren(id)
    .then(action => {
      if (!action || !action.payload || !action.payload.children) return

      const children = action.payload.children
      let proms = []

      // If we never loaded these children before, do it once now
      // This is to find out whether the children have children, so we can
      // show or hide UI for toggling folders
      // TODO: the grandchildren requests are network-heavy, and
      // can be removed if/when we have an API call to query folder counts
      if (children) {
        children.forEach(child => {
          // only load child's children if we haven't loaded this child before
          // or if the child has no children, so empty folders have a chance to update
          const childFolder = folders.all.get(child.id)
          if (!childFolder || !childFolder.childIds || !childFolder.childIds.size) {
            proms.push(this.props.actions.getFolderChildren(child.id))
          }
        })
      }

      Promise.all(proms)
      .then(() => { console.log(`Folder children all done loading for ${id}`) })
    })
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

  filterFolders = (event) => {
    const filterString = event.target.value
    this.setState({ filterString })
  }

  addFolder = () => {
    const isEditing = false
    this.props.actions.showCreateFolderModal(this.addFolderTitle(),
      isEditing, this.addFolderCallback())
  }

  addFolderTitle () {
    switch (this.props.filterName) {
      case 'browsing': return 'Create Browsing Folder'
      case 'smart': return 'Create Smart Collection'
      case 'simple': return 'Create Simple Collection'
    }
  }

  addFolderCallback () {
    switch (this.props.filterName) {
      case 'browsing': return this.createBrowsingFolder
      case 'smart': return this.createSmartFolder
      case 'simple': return this.createSimpleFolder
    }
  }

  createBrowsingFolder = (name, acl) => {
    console.log('Create browsing folder')
  }

  createSmartFolder = (name, acl) => {
    const search = new AssetSearch(this.props.query)
    search.aggs = null
    this.createFolder(name, acl, search)
  }

  createSimpleFolder = (name, acl) => {
    this.createFolder(name, acl, undefined)
  }

  createFolder (name, acl, search) {
    const parentId = this.selectedParentId()
    const folder = new Folder({ name, parentId, acl, search })
    this.props.actions.createFolder(folder)
  }

  selectedParentId () {
    const selectedFolderIds = this.props.folders.selectedFolderIds
    assert.ok(selectedFolderIds && selectedFolderIds.size === 1)
    return selectedFolderIds.values().next().value
  }

  addFolderIcon () {
    switch (this.props.filterName) {
      case 'browsing': return 'icon-folder'
      case 'smart': return 'icon-cube'
      case 'simple': return 'icon-cube'
    }
  }

  isAddFolderEnabled () {
    const { folders, query } = this.props
    const selectedFolderIds = folders.selectedFolderIds
    switch (this.props.filterName) {
      case 'browsing': return true
      case 'smart': return !query.empty()
      case 'simple': return selectedFolderIds && selectedFolderIds.size === 1
    }
  }

  renderFolderList (folder, depth) {
    const { folders, filterName } = this.props
    const { filterString } = this.state
    const isOpen = folders.openFolderIds.has(folder.id)
    const isSelected = folders.selectedFolderIds.has(folder.id)
    const childIds = folder.childIds

    // Show this folder, except for root, we don't need to see root
    let folderList = (depth > 0) ? [
      (<FolderItem {...{depth, folder, isOpen, isSelected}}
        key={folder.id}
        hasChildren={childIds && childIds.size > 0}
        onToggle={this.toggleFolder.bind(this, folder)}
        onSelect={this.selectFolder.bind(this, folder)}
      />)
    ] : []

    let grandkids = []
    if (childIds && isOpen) {
      let children = []
      childIds.forEach(childId => children.push(folders.all.get(childId)))
      // Filter the tree at the root by the filter type passed in from Workspace
      if (depth === 0) {
        children = children.filter(Folder.Filters[filterName])
      }
      children.forEach(child => {
        grandkids = grandkids.concat(this.renderFolderList(child, depth + 1))
      })
    }

    // Filter the list, showing parent if any descendents match
    if (grandkids.length || folder.name.toLowerCase().includes(filterString.toLowerCase())) {
      return folderList.concat(grandkids)
    }

    return []
  }

  render () {
    const { folders } = this.props
    const rootLoaded = folders.all.has(Folder.ROOT_ID)
    if (!rootLoaded) return null
    const rootFolder = folders.all.get(Folder.ROOT_ID)
    const folderList = this.renderFolderList(rootFolder, 0)
    return (
      <div className='Folders'>
        <div className="Folders-controls">
          <input type="text" value={this.state.filterString} onChange={this.filterFolders} placeholder="Filter Collections" />
          <button disabled={!this.isAddFolderEnabled()} onClick={this.addFolder}>
            <span className={this.addFolderIcon()}/>
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
  folders: state.folders,
  query: state.assets.query
}), dispatch => ({
  actions: bindActionCreators({
    getFolderChildren,
    createFolder,
    selectFolderIds,
    toggleFolder,
    showCreateFolderModal
  }, dispatch)
}))(Folders)
