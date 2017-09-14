import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import LRUCache from 'lru-cache'

import User from '../../models/User'
import Folder from '../../models/Folder'
import AclEntry from '../../models/Acl'
import AssetSearch from '../../models/AssetSearch'
import { getFolderChildren, createFolder, selectFolderIds, selectFolderId,
  toggleFolder, queueFolderCounts } from '../../actions/folderAction'
import { showModal, sortFolders } from '../../actions/appActions'
import Trash from './Trash'
import FolderItem from './FolderItem'
import CreateFolder from './CreateFolder'
import { equalSets } from '../../services/jsUtil'
import { DropTarget } from '../../services/DragDrop'

const SORT_ALPHABETICAL = 'alpha'
const SORT_TIME = 'time'

const FOLDER_HEIGHT_PX = 25
const FOLDER_EMPTY_HEIGHT_PX = 70
const MAX_FOLDER_SCROLL_HEIGHT_PX = 400

const FOLDER_COUNT_SCROLL_IDLE_THRESH_MS = 250 // ms to wait after scrolling stops before requesting folder counts

const NUMTRUE = {numeric: true}

const target = { drop (props, se) { /* only needed for highlighting -- drop happens on FolderItem */ } }

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
@DropTarget(target)
class Folders extends Component {
  static propTypes = {
    // input props
    rootId: PropTypes.number,
    rootName: PropTypes.string,
    filter: PropTypes.func,
    onSelect: PropTypes.func,

    dragInfo: PropTypes.object,

    // connect props
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    assetsCounter: PropTypes.number.isRequired,

    // state props
    folders: PropTypes.object.isRequired,
    sortFolders: PropTypes.string,
    user: PropTypes.instanceOf(User)
  }

  constructor (props) {
    super(props)

    this.state = {
      rootId: undefined,
      filterString: '',
      foldersScrollTop: 0,
      foldersScrollHeight: 0
    }

    this.folderSortCache = new LRUCache({ max: 1000 })

    this.foldersVisible = new Set()
    this.folderCountRequested = new Map()
    this.requestFolderCountsTimer

    this.assetsCounter = 0
  }

  queueFolderCounts = () => {
    clearTimeout(this.requestFolderCountsTimer)
    this.requestFolderCountsTimer = setTimeout(this.requestFolderCounts, FOLDER_COUNT_SCROLL_IDLE_THRESH_MS)
  }

  requestFolderCounts = () => {
    var requestSet = new Set(this.foldersVisible)
    for (let id of requestSet) {
      if (this.folderCountRequested.get(id) === this.assetsCounter) requestSet.delete(id)
    }
    this.props.actions.queueFolderCounts(requestSet)
    for (let id of requestSet) this.folderCountRequested.set(id, this.assetsCounter)
  }

  foldersScroll = (event) => {
    this.setState({
      foldersScrollTop: event.target.scrollTop,
      foldersScrollHeight: event.target.clientHeight
    })
  }

  componentWillMount () {
    const all = this.props.folders.all
    const { rootId } = this.props
    const rootFolder = all.get(rootId === undefined ? Folder.ROOT_ID : rootId)
    if (!rootFolder.childIds || !rootFolder.childIds.size) {
      this.loadChildren(rootFolder)
    }
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (nextProps) {
    // Force load the User folder's children so we can find the home folder
    const all = nextProps.folders.all
    const rootFolder = all.get(Folder.ROOT_ID)
    if (rootFolder && rootFolder.childIds) {
      const rootChildIds = [...rootFolder.childIds]
      const index = rootChildIds.findIndex(id => all.get(id).name === 'Users')
      if (index >= 0) {
        const userFolder = all.get(rootChildIds[index])
        if (!userFolder.childIds) this.loadChildren(userFolder)
      }
    }

    // Search through the root folder to find the named root, if needed
    if (this.state.rootId === undefined && nextProps.rootName) {
      // Find the folder in the root node that matches the requested prop root name
      const all = nextProps.folders.all
      const rootFolder = all.get(Folder.ROOT_ID)
      if (rootFolder && rootFolder.childIds) {
        const rootChildIds = [...rootFolder.childIds]
        const index = rootChildIds.findIndex(id => all.get(id).name === nextProps.rootName)
        if (index >= 0) this.setState({ rootId: rootChildIds[index] })
      }
    } else if (this.state.rootId === undefined && nextProps.rootId !== undefined) {
      this.setState({ rootId: nextProps.rootId })
    } else if (this.state.rootId === undefined) {
      this.setState({ rootId: Folder.ROOT_ID })
    }
  }

  sortOrder () {
    return this.props.sortFolders || 'alpha-asc'
  }

  loadChildren (folder) {
    folder.childIds = new Set()   // Warning: modifying app state to avoid multiple loads
    this.props.actions.getFolderChildren(folder.id)
  }

  isOpen = (folderId) => (folderId === this.state.rootId || this.props.folders.openFolderIds.has(folderId))

  toggleFolder = (folder) => {
    const { folders } = this.props
    const isOpen = this.isOpen(folder.id)
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
    if (doOpen) {
      this.loadChildren(folder)
      this.scrollToFolder(folder.id)
    }

    // evict all folders from counted list; will start refreshing everyone
    this.folderCountRequested = new Map()
  }

  scrollToFolder = (folderId) => {
    const { folders } = this.props
    const { foldersScrollTop, foldersScrollHeight, rootId } = this.state
    const folderList = this.folderList(folders.all.get(rootId))
    const folderPosition = folderList.findIndex(folder => folder.id === folderId)
    if (folderPosition < 0) return

    // scroll up by one folder if the opened folder is the last one
    // I played with more agressive scrolling rules and it's very disorienting
    // Maybe this should be removed
    // Animated scrolling might help though
    const folderHeight = folderPosition * FOLDER_HEIGHT_PX
    if (folderHeight > foldersScrollTop + foldersScrollHeight - 1.5 * FOLDER_HEIGHT_PX) {
      this.refs.foldersScroll.scrollTop = foldersScrollTop + FOLDER_HEIGHT_PX
    }
  }

  // Apply standard desktop shift+meta multi-select on click and update state.
  selectFolder (folder, event) {
    const { folders, onSelect } = this.props
    if (onSelect) return onSelect(folder, event)
    const rootFolder = folders.all.get(this.state.rootId)
    const folderList = this.folderList(rootFolder)
    this.props.actions.selectFolderId(folder.id, event.shiftKey, event.metaKey,
      folderList, this.props.folders.selectedFolderIds, this.props.folders.all)
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
    const body = <CreateFolder title='Create Collection' acl={[]} name=""
                               includeAssets={true} includePermissions={false}
                               onCreate={this.createFolder}/>
    this.props.actions.showModal({body, width})
  }

  createFolder = (name, acl, assetIds) => {
    const parentId = this.state.rootId
    const folder = new Folder({ name, parentId, acl })
    this.props.actions.createFolder(folder, assetIds)
  }

  cannotAddFolderReason () {
    const { folders, user } = this.props
    // True if one folder is selected, it isn't in the trash, and we have write permission
    const selectedFolderIds = folders.selectedFolderIds
    if (selectedFolderIds && selectedFolderIds.size > 0) {
      if (selectedFolderIds.size > 1) return 'Select a single parent folder'
      const id = selectedFolderIds.values().next().value
      if (folders.trashedFolders) {
        const index = folders.trashedFolders.findIndex(trashedFolder => (trashedFolder.folderId === id))
        if (index >= 0) return 'Select a folder outside of trash'
      }
      const folder = folders.all.get(id)
      if (!folder) return 'Selected folder does not exist'
      if (folder.isDyhi()) return 'Cannot add child to automatic smart folder'
      if (folder.isSmartCollection()) return 'Cannot add child to smart folder'
      if (!folder.hasAccess(user, AclEntry.WriteAccess)) return 'No write permission to parent folder'
    }
  }

  folderCompare = (a, b) => {
    if (a.isDyhi() && !b.isDyhi()) return -1
    if (b.isDyhi() && !a.isDyhi()) return 1
    if (a.search && !b.search) return -1
    if (b.search && !a.search) return 1

    switch (this.sortOrder()) {
      case 'alpha-desc':
        return b.name.localeCompare(a.name, undefined, NUMTRUE)
      case 'time-asc':
        return a.timeModified < b.timeModified ? -1 : (a.timeModified > b.timeModified ? 1 : 0)
      case 'time-desc':
        return b.timeModified < a.timeModified ? -1 : (b.timeModified > a.timeModified ? 1 : 0)
    }

    return a.name.localeCompare(b.name, undefined, NUMTRUE)
  }

  // http://stackoverflow.com/a/7616484/1424242
  hashCode = (str, optHash) => {
    let hash = optHash || 0
    if (str.length === 0) return hash
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  folderList (folder) {
    const { folders, filter } = this.props
    const { filterString, rootId } = this.state
    const isOpen = this.isOpen(folder.id)
    const childIds = folder.childIds

    // Show this folder, except for root, we don't need to see root
    let folderList = (folder.id !== rootId) ? [folder] : []

    let grandkids = []
    if (childIds && isOpen) {
      let children = []
      let childrenNameHash = 0
      childIds.forEach(childId => {
        children.push(folders.all.get(childId))
        // compute a hash of all child ids, to use in the key of our sort order cache
        // If the list of children changes, the key will change, which will force a re-sort & new cache entry
        childrenNameHash = this.hashCode(childId.toString(), childrenNameHash)
      })

      // We are caching the folder sort because alphabetic sort is SLOW, and this runs every frame (e.g., while scrolling)
      const key = `${folder.id}|${this.sortOrder()}|${children.length}|${childrenNameHash}`
      let childrenSortOrder = this.folderSortCache.get(key)
      if (childrenSortOrder) {
        // If we already sorted before and nothing's changed, retrieve the sort order
        children = childrenSortOrder.map(id => folders.all.get(id))
      } else {
        // Sort children by selected sort, initially partitioned by type: dyhi, smart, simple
        if (filter) children = children.filter(filter)
        children.sort(this.folderCompare)
        childrenSortOrder = children.map(folder => folder.id)
        // Once we sort, store the sort order in our sort order cache
        this.folderSortCache.set(key, childrenSortOrder)
      }

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
    const { folders } = this.props
    if (folder.id === this.state.rootId) return 0
    const parent = folders.all.get(folder.parentId)
    return this.depth(parent) + 1
  }

  isDropTarget () {
    const { dragInfo, folders, user } = this.props
    if (!dragInfo) return false
    const root = folders.all.get(this.state.rootId)
    if (root && dragInfo.type === 'FOLDER' && dragInfo.folderIds) {
      return root.canAddChildFolderIds(dragInfo.folderIds, folders.all, user)
    }
    return false
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
    let prevFoldersVisible = new Set([...this.foldersVisible])
    this.foldersVisible.clear()

    for (let i = startIndex; i <= stopIndex; i++) {
      const folder = folderList[i]
      const key = folder.id
      const { folders, onSelect } = this.props
      const depth = this.depth(folder)
      const isOpen = this.isOpen(folder.id)
      const isSelected = !onSelect && folders.selectedFolderIds.has(folder.id)
      const hasChildren = folder.childCount > 0

      this.foldersVisible.add(folder.id)

      renderedFolders.push(
        <FolderItem {...{key, depth, folder, isOpen, isSelected, hasChildren, top: `${i * FOLDER_HEIGHT_PX}px`}}
          onToggle={this.toggleFolder.bind(this, folder)}
          onSelect={this.selectFolder.bind(this, folder)} />
      )
    }

    if (!equalSets(prevFoldersVisible, this.foldersVisible)) this.queueFolderCounts()
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
    const { folders, user, query } = this.props
    const { filterString, rootId } = this.state
    const rootLoaded = folders.all.has(rootId)
    if (!rootLoaded) return null

    if (this.props.assetsCounter !== this.assetsCounter && !query.from) {
      this.assetsCounter = this.props.assetsCounter
      // evict all folders from counted list; will start refreshing everyone
      this.folderCountRequested = new Map()
      this.queueFolderCounts()
    }

    const folderList = this.folderList(folders.all.get(rootId))
    const numOpenFolders = folderList.length
    const foldersBodyHeight = numOpenFolders * FOLDER_HEIGHT_PX || FOLDER_EMPTY_HEIGHT_PX
    const foldersScrollHeight = Math.min(foldersBodyHeight, MAX_FOLDER_SCROLL_HEIGHT_PX)
    const folderComponentList = this.renderFolderList(folderList, foldersScrollHeight)

    requestAnimationFrame(_ => {
      // ignore this code if the user just closed the panel
      if (!this.refs.foldersScroll) return

      const foldersScrollTop = this.refs.foldersScroll.scrollTop
      const foldersScrollHeight = this.refs.foldersScroll.clientHeight

      if (foldersScrollTop !== this.state.foldersScrollTop ||
        foldersScrollHeight !== this.state.foldersScrollHeight) {
        this.setState({
          foldersScrollTop: this.refs.foldersScroll.scrollTop,
          foldersScrollHeight: this.refs.foldersScroll.clientHeight
        })
      }
    })

    const dragHover = folders.dropFolderId === rootId
    const isDropTarget = this.isDropTarget()
    const root = folders.all.get(rootId)
    const canAddFolder = root && root.id === user.homeFolderId
    const cannotAddError = this.cannotAddFolderReason()
    return (
      <div className={classnames('Folders', {isDropTarget, dragHover})}>
        <div className="Folders-controls">
          <div className="Folders-filter-add">
            <div className="Folders-filter">
              <input className="Folders-filter-input" type="text" value={filterString}
                     onChange={this.filterFolders}
                     placeholder='Filter collections' />
              { filterString && filterString.length && <div onClick={this.cancelFilter} className="Folders-cancel-filter icon-cancel-circle"/> }
              <div className="icon-search"/>

            </div>
            { canAddFolder && <div className={classnames('Folders-controls-add', {disabled: cannotAddError})}
                                   title={cannotAddError || 'Create a new folder'}
                                   onClick={!cannotAddError && this.addFolder}>
              <span className='icon-collections-add'/>
              <div className="Folders-controls-add-label">NEW</div>
            </div> }
          </div>
          <div className="Folders-sort-selected">
            <div className="Folders-sort">
              { this.renderSortButton(SORT_ALPHABETICAL) }
              { this.renderSortButton(SORT_TIME) }
            </div>
            { this.renderFolderDeselector(folderList) }
          </div>
        </div>
        {folderComponentList ? <Trash/> : null }
        <div ref='foldersScroll'
             className='Folders-scroll'
             onScroll={this.foldersScroll}
             style={{height: `${foldersScrollHeight}px`, maxHeight: `${foldersScrollHeight}px`}}>
          <div className='Folders-body'
               style={{ height: `${foldersBodyHeight}px` }}>
            {folderComponentList}
            {(!folderComponentList || !folderComponentList.length) && (
              <div className="Folders-empty">
                <div className="Folders-empty-icon icon-emptybox"/>
                <div className="Folders-empty-label">No Folders</div>
              </div>
            )}
          </div>
          <div className="Folders-drop-target"/>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  folders: state.folders,
  sortFolders: state.app.sortFolders,
  query: state.assets.query,
  assetsCounter: state.assets.assetsCounter,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    getFolderChildren,
    createFolder,
    selectFolderIds,
    selectFolderId,
    toggleFolder,
    showModal,
    sortFolders,
    queueFolderCounts
  }, dispatch)
}))(Folders)
