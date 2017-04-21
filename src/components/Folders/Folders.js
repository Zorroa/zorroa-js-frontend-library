import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Folder from '../../models/Folder'
import { getFolderChildren, createFolder, selectFolderIds, selectFolderId, toggleFolder } from '../../actions/folderAction'
import { showModal, sortFolders } from '../../actions/appActions'
import Trash from './Trash'
import FolderItem from './FolderItem'
import CreateFolder from './CreateFolder'

const SORT_ALPHABETICAL = 'alpha'
const SORT_TIME = 'time'

const FOLDER_HEIGHT_PX = 25
const MAX_FOLDER_SCROLL_HEIGHT_PX = 400

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
class Folders extends Component {
  static propTypes = {
    // input props
    filter: PropTypes.func,
    onSelect: PropTypes.func,

    // connect props
    actions: PropTypes.object.isRequired,

    // state props
    folders: PropTypes.object.isRequired,
    sortFolders: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      filterString: '',
      foldersScrollTop: 0,
      foldersScrollHeight: 0
    }
  }

  foldersScroll = (event) => {
    this.setState({
      foldersScrollTop: event.target.scrollTop,
      foldersScrollHeight: event.target.clientHeight
    })
  }

  componentWillMount () {
    const rootFolder = this.props.folders.all.get(Folder.ROOT_ID)
    if (!rootFolder.childIds || !rootFolder.childIds.size) {
      this.loadChildren(rootFolder)
    }
  }

  sortOrder () {
    return this.props.sortFolders || 'alpha-asc'
  }

  loadChildren (folder) {
    folder.childIds = new Set()   // Warning: modifying app state to avoid multiple loads
    this.props.actions.getFolderChildren(folder.id)
  }

  toggleFolder = (folder) => {
    const { folders } = this.props
    const isOpen = folders.openFolderIds.has(folder.id)
    const hasChildren = folder.childCount > 0

    // If any descendants of the current folder are currently selected,
    // and user is trying to close the current folder,
    // then prevent closing the current folder
    const lockOpenIfChildSelected = false
    if (lockOpenIfChildSelected && !isOpen && hasChildren && folders.selectedFolderIds.size) {
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
    if (doOpen) this.loadChildren(folder)
  }

  // Apply standard desktop shift+meta multi-select on click and update state.
  selectFolder (folder, event) {
    const { folders, onSelect } = this.props
    if (onSelect) return onSelect(folder, event)
    const rootFolder = folders.all.get(Folder.ROOT_ID)
    const folderList = this.folderList(rootFolder)
    this.props.actions.selectFolderId(folder.id, event.shiftKey, event.metaKey,
      folderList, this.props.folders.selectedFolderIds)
  }

  filterFolders = (event) => {
    const filterString = event.target.value
    this.setState({ filterString })
  }

  cancelFilter = (event) => {
    this.setState({ filterString: '' })
  }

  deselectAll = (event) => {
    this.props.actions.selectFolderIds()
  }

  sortFolders (field) {
    const sort = this.sortOrder()
    let newSort = sort
    switch (field) {
      case SORT_ALPHABETICAL:
        if (sort === 'alpha-asc') {
          newSort = 'alpha-desc'
        } else {
          newSort = 'alpha-asc'
        }
        break
      case SORT_TIME:
        if (sort === 'time-asc') {
          newSort = 'time-desc'
        } else {
          newSort = 'time-asc'
        }
        break
    }
    this.props.actions.sortFolders(newSort)
  }

  addFolder = () => {
    const width = '300px'
    const body = <CreateFolder title='Create Collection' acl={[]}
                               onCreate={this.createFolder}/>
    this.props.actions.showModal({body, width})
  }

  createFolder = (name, acl, search) => {
    const parentId = this.selectedParentId()
    const folder = new Folder({ name, parentId, acl, search })
    this.props.actions.createFolder(folder)
  }

  selectedParentId () {
    const selectedFolderIds = this.props.folders.selectedFolderIds
    if (!selectedFolderIds || selectedFolderIds.size < 1) return Folder.ROOT_ID
    return selectedFolderIds.values().next().value
  }

  isAddFolderEnabled () {
    const { folders } = this.props
    // True if one folder is selected and it isn't in the trash
    const selectedFolderIds = folders.selectedFolderIds
    if (!selectedFolderIds || selectedFolderIds.size !== 1) return false
    if (!folders.trashedFolders) return true
    const id = selectedFolderIds.values().next().value
    const index = folders.trashedFolders.findIndex(trashedFolder => (trashedFolder.folderId === id))
    return index < 0
  }

  folderList (folder) {
    const { folders, filter } = this.props
    const { filterString } = this.state
    const isOpen = folders.openFolderIds.has(folder.id)
    const childIds = folder.childIds

    // Show this folder, except for root, we don't need to see root
    let folderList = (folder.id !== Folder.ROOT_ID) ? [folder] : []

    let grandkids = []
    if (childIds && isOpen) {
      let children = []
      childIds.forEach(childId => children.push(folders.all.get(childId)))

      // Sort children by selected sort, initially partitioned by type: dyhi, smart, simple
      const typeCompare = (a, b) => {
        if (a.isDyhi() && !b.isDyhi()) return -1
        if (b.isDyhi() && !a.isDyhi()) return 1
        if (a.search && !b.search) return -1
        if (b.search && !a.search) return 1
        return 0
      }
      if (filter) {
        children = children.filter(filter)
      }
      let subsort = (a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})
      switch (this.sortOrder()) {
        case 'alpha-asc':
          break
        case 'alpha-desc':
          subsort = (a, b) => b.name.localeCompare(a.name, undefined, {numeric: true})
          break
        case 'time-asc':
          subsort = (a, b) => a.timeModified < b.timeModified ? -1 : (a.timeModified > b.timeModified ? 1 : 0)
          break
        case 'time-desc':
          subsort = (a, b) => b.timeModified < a.timeModified ? -1 : (b.timeModified > a.timeModified ? 1 : 0)
          break
      }

      children.sort((a, b) => typeCompare(a, b) || subsort(a, b))
      children.forEach(child => {
        grandkids = grandkids.concat(this.folderList(child))
      })
    } else if (!childIds && isOpen) {
      this.loadChildren(folder)
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

  renderFolderList = (folderList, foldersScrollHeight) => {
    const { foldersScrollTop } = this.state
    let startIndex = Math.floor(foldersScrollTop / FOLDER_HEIGHT_PX)
    // make sure startIndex is even, so the alternating color scheme doesn't spazz while scrolling
    if (startIndex % 2 === 1 && startIndex > 0) startIndex--
    const stopIndex = Math.min(
      Math.ceil((foldersScrollTop + foldersScrollHeight) / FOLDER_HEIGHT_PX),
      folderList.length - 1
    )

    let renderedFolders = []

    for (let i = startIndex; i <= stopIndex; i++) {
      const folder = folderList[i]
      const key = folder.id
      const { folders, onSelect } = this.props
      const depth = this.depth(folder)
      const isOpen = folders.openFolderIds.has(folder.id)
      const isSelected = !onSelect && folders.selectedFolderIds.has(folder.id)
      const hasChildren = folder.childCount > 0
      renderedFolders.push(
        <FolderItem {...{key, depth, folder, isOpen, isSelected, hasChildren, top: `${i * FOLDER_HEIGHT_PX}px`}}
          onToggle={this.toggleFolder.bind(this, folder)}
          onSelect={this.selectFolder.bind(this, folder)} />
      )
    }

    return renderedFolders
  }

  renderSortButton (field) {
    const sort = this.sortOrder()
    const enabled = sort.match(field) != null
    const icon = enabled ? `icon-sort-${sort}` : `icon-sort-${field}-asc`
    return (
      <div onClick={this.sortFolders.bind(this, field)} className={classnames('Folders-sort-button', icon, {enabled})}/>
    )
  }

  renderFolderDeselector (folderList) {
    const selectedFolderIds = this.props.folders && this.props.folders.selectedFolderIds
    if (!selectedFolderIds || selectedFolderIds.size === 0) return null
    return (
      <div className="Folders-selected">
        { `${selectedFolderIds.size} folders selected` }
        <div onClick={this.deselectAll} className="Folders-deselect-all icon-cancel-circle"/>
      </div>
    )
  }

  render () {
    const { folders } = this.props
    const { filterString } = this.state
    const rootLoaded = folders.all.has(Folder.ROOT_ID)
    if (!rootLoaded) return null
    const folderList = this.folderList(folders.all.get(Folder.ROOT_ID))
    const numOpenFolders = folderList.length
    const foldersBodyHeight = numOpenFolders * FOLDER_HEIGHT_PX
    const foldersScrollHeight = Math.min(foldersBodyHeight, MAX_FOLDER_SCROLL_HEIGHT_PX)

    const folderComponentList = this.renderFolderList(folderList, foldersScrollHeight)

    return (
      <div className='Folders'>
        <div className="Folders-controls">
          <div className="Folders-filter-add">
            <div className="Folders-filter">
              <input className="Folders-filter-input" type="text" value={filterString}
                     onChange={this.filterFolders}
                     placeholder='Filter collections' />
              { filterString && filterString.length && <div onClick={this.cancelFilter} className="Folders-cancel-filter icon-cancel-circle"/> }
              <div className="icon-search"/>

            </div>
            <div className={classnames('Folders-controls-add',
              {disabled: !this.isAddFolderEnabled()})}
                 onClick={this.isAddFolderEnabled() ? this.addFolder : null}>
              <span className='icon-collections-add'/>
            </div>
          </div>
          <div className="Folders-sort-selected">
            <div className="Folders-sort">
              { this.renderSortButton(SORT_ALPHABETICAL) }
              { this.renderSortButton(SORT_TIME) }
            </div>
            { this.renderFolderDeselector(folderList) }
            </div>
        </div>
        <div ref='foldersScroll'
             className='Folders-scroll'
             onScroll={this.foldersScroll}
             style={{height: `${foldersScrollHeight}px`, maxHeight: `${foldersScrollHeight}px`}}>
          <div className='Folders-body'
               style={{ height: `${foldersBodyHeight}px` }}>
            {folderComponentList}
            {folderComponentList ? <Trash/> : null }
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  folders: state.folders,
  sortFolders: state.app.sortFolders
}), dispatch => ({
  actions: bindActionCreators({
    getFolderChildren,
    createFolder,
    selectFolderIds,
    selectFolderId,
    toggleFolder,
    showModal,
    sortFolders
  }, dispatch)
}))(Folders)
