import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'
import classnames from 'classnames'

import Folder from '../../models/Folder'
import { getFolderChildren, createFolder, selectFolderId, toggleFolder } from '../../actions/folderAction'
import { showModal } from '../../actions/appActions'
import Trash from './Trash'
import FolderItem from './FolderItem'
import AssetSearch from '../../models/AssetSearch'
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
    const hasChildren = folder.childIds && folder.childIds.size > 0

    // If any descendants of the current folder are currently selected,
    // and user is trying to close the current folder,
    // then prevent closing the current folder
    if (isOpen && hasChildren && folders.selectedFolderIds.size) {
      // Start with the parents of all selected folders.
      var selectedFolders = Array.from(folders.selectedFolderIds).map(id => folders.all.get(id))
      var selectedParentIds = selectedFolders.map(f => f.parentId)
      // Filter out any invalid ids (which means parent of root)
      var parentFolders = selectedParentIds.map(id => folders.all.get(id)).filter(f => !!f)

      // Transitive closure of parents - we'll compute parents and parents of parents
      // until we've exhausted all parents. We're done when we run out of parents.
      // NB this loop depends on ROOT's parent Id being undefined. Update if ROOT points to itself.
      while (parentFolders.length) {
        // If this folder is in the current parent set, bail out now to prevent close
        if (parentFolders.filter(f => f.id === folder.id).length) return

        // Find all grandparents - parents of the current parents
        parentFolders = parentFolders.map(f => folders.all.get(f.parentId)).filter(f => !!f)
      }
    }

    const doOpen = !isOpen
    this.props.actions.toggleFolder(folder.id, doOpen)
    if (doOpen) this.loadChildren(folder.id)
  }

  // Apply standard desktop shift+meta multi-select on click and update state.
  selectFolder (folder, event) {
    const { folders } = this.props
    const rootFolder = folders.all.get(Folder.ROOT_ID)
    const folderList = this.folderList(rootFolder)
    this.props.actions.selectFolderId(folder.id, event.shiftKey, event.metaKey,
      folderList, this.props.folders.selectedFolderIds)
  }

  filterFolders = (event) => {
    const filterString = event.target.value
    this.setState({ filterString })
  }

  addFolder = () => {
    const width = '300px'
    const body = <CreateFolder title={this.addFolderTitle()} acl={[]}
                               onCreate={this.addFolderCallback()}/>
    this.props.actions.showModal({body, width})
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
    if (!selectedFolderIds || selectedFolderIds.size < 1) return Folder.ROOT_ID
    return selectedFolderIds.values().next().value
  }

  addFolderIcon () {
    switch (this.props.filterName) {
      case 'browsing': return 'icon-folder-add'
      case 'smart': return 'icon-collections-add'
      case 'simple': return 'icon-collections-add'
    }
  }

  filterPlaceholder () {
    switch (this.props.filterName) {
      case 'browsing': return 'Filter browsing folders'
      case 'smart': return 'Filter smart collections'
      case 'simple': return 'Filter simple collections'
    }
  }

  isAddFolderEnabled () {
    const { folders, query } = this.props
    switch (this.props.filterName) {
      case 'browsing': return false
      case 'smart': return query && !query.empty()
      case 'simple': {
        // True if one folder is selected and it isn't in the trash
        const selectedFolderIds = folders.selectedFolderIds
        if (!selectedFolderIds || selectedFolderIds.size !== 1) return false
        if (!folders.trashedFolders) return true
        const id = selectedFolderIds.values().next().value
        const index = folders.trashedFolders.findIndex(trashedFolder => (trashedFolder.folderId === id))
        return index < 0
      }
    }
  }

  folderList (folder) {
    const { folders, filterName } = this.props
    const { filterString } = this.state
    const isOpen = folders.openFolderIds.has(folder.id)
    const childIds = folder.childIds

    // Show this folder, except for root, we don't need to see root
    let folderList = (folder.id !== Folder.ROOT_ID) ? [folder] : []

    let grandkids = []
    if (childIds && isOpen) {
      let children = []
      childIds.forEach(childId => children.push(folders.all.get(childId)))
      // Filter the tree at the root by the filter type passed in from Workspace
      if (folder.id === Folder.ROOT_ID) {
        children = children.filter(Folder.Filters[filterName])
      }
      children.forEach(child => {
        grandkids = grandkids.concat(this.folderList(child))
      })
    } else if (!childIds && isOpen) {
      this.loadChildren(folder.id)
    }

    // Filter the list, showing parent if any descendents match
    if (grandkids.length || folder.name.toLowerCase().includes(filterString.toLowerCase())) {
      return folderList.concat(grandkids)
    }

    return []
  }

  depth (folder) {
    if (folder.id === Folder.ROOT_ID) return 0
    const { folders } = this.props
    const parent = folders.all.get(folder.parentId)
    return this.depth(parent) + 1
  }

  renderFolderList = (rootFolder) => (
    this.folderList(rootFolder).map(folder => {
      const key = folder.id
      const { folders } = this.props
      const depth = this.depth(folder)
      const isOpen = folders.openFolderIds.has(folder.id)
      const isSelected = folders.selectedFolderIds.has(folder.id)
      const hasChildren = (folder.childIds && folder.childIds.size > 0) || false
      return (
        <FolderItem {...{key, depth, folder, isOpen, isSelected, hasChildren}}
                    onToggle={this.toggleFolder.bind(this, folder)}
                    onSelect={this.selectFolder.bind(this, folder)} />
      )
    })
  )

  render () {
    const { folders, filterName } = this.props
    const rootLoaded = folders.all.has(Folder.ROOT_ID)
    if (!rootLoaded) return null
    const folderList = this.renderFolderList(folders.all.get(Folder.ROOT_ID))
    return (
      <div className='Folders'>
        <div className="Folders-controls">
          <div className="Folders-filter">
            <input type="text" value={this.state.filterString}
                   onChange={this.filterFolders}
                   placeholder={this.filterPlaceholder()} />
            <div className="icon-search"/>
          </div>
          <div className={classnames('Folders-controls-add',
            {disabled: !this.isAddFolderEnabled()})}
               onClick={this.isAddFolderEnabled() ? this.addFolder : null}>
            <span className={this.addFolderIcon()}/>
          </div>
        </div>
        <div>
          {folderList}
          {folderList.length ? <Trash filterName={filterName}/> : null }
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
    selectFolderId,
    toggleFolder,
    showModal
  }, dispatch)
}))(Folders)
