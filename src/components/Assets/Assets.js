import React, { Component, PropTypes } from 'react'
import Measure from 'react-measure'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'
import * as assert from 'assert'

import Thumb, { page, monopageBadges, multipageBadges } from '../Thumb'
import User from '../../models/User'
import Asset from '../../models/Asset'
import Widget from '../../models/Widget'
import Folder from '../../models/Folder'
import { isolateAssetId, selectAssetIds, sortAssets, searchAssets, similarAssets, unorderAssets, isolateParent } from '../../actions/assetsAction'
import { resetRacetrackWidgets, restoreFolders, similar } from '../../actions/racetrackAction'
import { selectFolderIds } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'
import { setThumbSize, setThumbLayout, showTable, setTableHeight, showMultipage, showModal, hideModal, iconifyRightSidebar } from '../../actions/appActions'
import Pager from './Pager'
import Footer from './Footer'
import Table from '../Table'
import Sidebar from '../Sidebar'
import Racetrack from '../Racetrack'
import FieldTemplate from '../FieldTemplate'
import * as ComputeLayout from './ComputeLayout.js'
import AssetSearch from '../../models/AssetSearch'
import Resizer from '../../services/Resizer'
import TrashedFolder from '../../models/TrashedFolder'
import { equalSets } from '../../services/jsUtil'
import * as api from '../../globals/api.js'
import { SESSION_STATE_ITEM } from '../../constants/localStorageItems'

const assetsScrollPadding = 8
const defaultTableHeight = 300

class Assets extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assetsCounter: PropTypes.number.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    order: PropTypes.arrayOf(PropTypes.object),
    parentCounts: PropTypes.instanceOf(Map),
    parentTotals: PropTypes.instanceOf(Map),
    isolatedParent: PropTypes.instanceOf(Asset),
    selectedIds: PropTypes.object,
    selectionCounter: PropTypes.number.isRequired,
    totalCount: PropTypes.number,
    loadedCount: PropTypes.number,
    filteredCount: PropTypes.number,
    thumbSize: PropTypes.number.isRequired,
    layout: PropTypes.string.isRequired,
    showTable: PropTypes.bool.isRequired,
    tableHeight: PropTypes.number.isRequired,
    showMultipage: PropTypes.bool.isRequired,
    thumbFieldTemplate: PropTypes.string.isRequired,
    rightSidebarIsIconified: PropTypes.bool,
    folders: PropTypes.instanceOf(Map),
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      ofsIds: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    uxLevel: PropTypes.number,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    origin: PropTypes.string,
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)

    // Store layout as app state so it is retained on route and reload.
    // Requires passing layout info to subcomponents as needed, rather
    // than passing in global app state, which would also force the
    // otherwise simple sub-components to be Redux containers.
    this.state = {
      lastSelectedId: null,
      assetsScrollTop: 0,
      assetsScrollHeight: 0,
      assetsScrollWidth: 0,
      tableIsResizing: false,
      positions: [],
      multipage: {},
      collapsed: 0,
      badgeId: null
    }

    this.newTableHeight = 0
    this.updateAssetsScrollSizeInterval = null
    this.selectionCounter = 0
    this.skipNextSelectionScroll = false
    this.scrollToSelectionAfterLayout = false
    this.assetsLayoutTimer = null
    this.assetsCounter = 0
    this.resizer = null
    this.loaded = 0

    this.history = {}
    this.historyNav = null
  }

  // Adjust the selection set for the specified asset using
  // the modifier keys for shift to extend and command to
  // toggle entries. We keep the anchor point for shift-select
  // in local state and must update it when the search changes.
  select = (asset, event) => {
    const { assets, selectedIds, actions } = this.props
    const { lastSelectedId } = this.state
    let ids
    if (event.shiftKey) {
      // Use the local state anchor point to extend the selected set.
      // Empty selectedIds implies new search -> ignore lastSelectedId
      if (lastSelectedId && selectedIds && selectedIds.size) {
        const lastSelectedIndex = assets.findIndex(a => (a.id === lastSelectedId))
        if (lastSelectedIndex >= 0) {
          const index = assets.findIndex(a => (a.id === asset.id))
          if (index >= 0) {
            ids = new Set()
            const min = Math.min(index, lastSelectedIndex)
            const max = Math.max(index, lastSelectedIndex)
            for (var i = min; i <= max; ++i) {
              ids.add(assets[i].id)
            }
          }
        }
      }
      if (!ids) {
        // Nothing in the extended selection set, treat as new selection
        ids = new Set([asset.id])
        this.setState({lastSelectedId: asset.id})
      }
    } else if (event.metaKey) {
      // Toggle the current asset on or off
      ids = new Set([...selectedIds])
      const siblings = new Set([asset.id])
      siblings.forEach(id => {
        if (ids.has(id)) {
          ids.delete(id)
        } else {
          ids.add(id)
        }
      })
      const lastSelectedId = ids.length ? asset.id : null
      this.setState({lastSelectedId})
    } else {
      ids = new Set([asset.id])
      if (selectedIds && equalSets(ids, selectedIds)) {
        // single click of a single selected asset should deselect
        ids = new Set()
        this.setState({lastSelectedId: null})
      } else {
        // Select the single asset and use it as the anchor point
        this.setState({lastSelectedId: asset.id})
      }
    }
    actions.selectAssetIds(ids)
  }

  @keydown('space')
  isolateSelected () {
    const { assets, selectedIds } = this.props
    if (selectedIds && selectedIds.size === 1) {
      const id = selectedIds.values().next().value
      const index = assets.findIndex(a => (a.id === id))
      if (index >= 0) {
        this.isolateToLightbox(assets[index])
      }
    }
  }

  isolateToLightbox = (asset) => {
    const { showMultipage, parentTotals, isolatedParent } = this.props
    const parentId = showMultipage && asset.parentId()
    const isolatedParentId = isolatedParent && isolatedParent.parentId()
    const stackCount = parentId && parentId !== isolatedParentId && parentTotals && parentTotals.get(parentId)
    if (stackCount > 1) {
      this.props.actions.isolateParent(asset)
    } else {
      // Select the isolated asset, which is DE-selected on the second click
      this.skipNextSelectionScroll = true
      this.select(asset, event)
      this.props.actions.isolateAssetId(asset.id)
    }
  }

  toggleShowTable = () => {
    const { showTable, user, userSettings, actions } = this.props
    actions.showTable(!showTable)
    actions.saveUserSettings(user, { ...userSettings, showTable: !showTable })
  }

  toggleShowMultipage = () => {
    const { showMultipage, user, userSettings, actions } = this.props
    actions.showMultipage(!showMultipage)
    actions.saveUserSettings(user, { ...userSettings, showMultipage: !showMultipage })
    this.queueAssetsLayout()
  }

  uncollapse = () => {
    const { user, userSettings, actions } = this.props
    actions.showMultipage(false)
    actions.saveUserSettings(user, { ...userSettings, showMultipage: false })
    this.queueAssetsLayout()
  }

  changeLayout (layout) {
    if (this.props.layout !== layout) {
      this.props.actions.setThumbLayout(layout)
      this.props.actions.saveUserSettings(this.props.user,
        { ...this.props.userSettings, thumbLayout: layout })
      this.queueAssetsLayout()
    }
  }

  changeThumbSize (thumbSize) {
    assert.ok(typeof thumbSize === 'number')
    if (this.props.thumbSize !== thumbSize) {
      this.props.actions.setThumbSize(thumbSize)
      this.props.actions.saveUserSettings(this.props.user,
        { ...this.props.userSettings, thumbSize })
      this.queueAssetsLayout()
    }
  }

  clearSearch = () => {
    this.props.actions.resetRacetrackWidgets()
    this.props.actions.selectFolderIds()
    this.props.actions.similar()
    this.props.actions.unorderAssets()
    this.props.actions.selectJobIds()
    this.props.actions.isolateParent()
  }

  tableResizeStart = (event) => {
    this.resizer.capture(this.tableResizeUpdate, this.tableResizeStop, 0, this.props.tableHeight, 0, -1)
    const tableHeight = this.clampTableHeight(this.state.tableHeight)
    this.newTableHeight = tableHeight
    this.setState({tableIsResizing: true})
  }

  tableResizeUpdate = (resizeX, resizeY) => {
    this.newTableHeight = this.clampTableHeight(resizeY)
    // wait one frame to handle the event, otherwise events queue up syncronously
    this.props.actions.setTableHeight(this.newTableHeight)
    this.updateAssetsScrollSize()
  }

  tableResizeStop = (event) => {
    this.props.actions.saveUserSettings(this.props.user,
      { ...this.props.userSettings, tableHeight: this.newTableHeight })
    this.setState({ tableIsResizing: false })
    this.queueAssetsLayout()
  }

  updateAssetsScrollSize = () => {
    const assetsScroll = this.refs.assetsScroll
    if (!assetsScroll) return
    if (assetsScroll.clientHeight !== this.state.assetsScrollHeight ||
      assetsScroll.clientWidth !== this.state.assetsScrollWidth) {
      this.setState({
        assetsScrollHeight: assetsScroll.clientHeight,
        assetsScrollWidth: assetsScroll.clientWidth
      })
      if (!this.state.tableIsResizing) this.queueAssetsLayout()
    }
  }

  componentWillMount = () => {
    if (this.updateAssetsScrollSizeInterval) {
      clearInterval(this.updateAssetsScrollSizeInterval)
    }
    this.updateAssetsScrollSizeInterval = setInterval(this.updateAssetsScrollSize, 150)
    this.resizer = new Resizer()
    this.updateSelectedHashes(this.props.similar.field, this.props.selectedIds)

    // Support using the navigation buttons to restore previous search state
    // This 'first' history entry is a sentinel we use to warn the user about going back too far & losing their history
    this.saveHistory('first')
    // called in response to both Back and Forward navigation, after navigation occurs
    window.onpopstate = this.restoreHistory
  }

  restoreHistory = (event) => {
    // location has the new URL, after having hit Back or Forward
    const historyKey = location.hash.slice(1)
    // Warn user if they're about to erase their history
    if (historyKey === 'first') {
      // TODO: factor this into a generic message dialog
      return new Promise((resolve) => {
        let dismissFn = (event) => {
          this.props.actions.hideModal()
          resolve()
        }
        const body = (
          <div className="Assets-history">
            <div className="Assets-history-header">
              <div className="Assets-history-title">History Warning</div>
              <div className="flexOn"/>
              <div className="Assets-history-close icon-cross" onClick={dismissFn}/>
            </div>
            <div className="Assets-history-msg">Going back any further will lose your history.</div>
            <button className="Assets-history-dismiss" onClick={dismissFn}>Okay</button>
          </div>
        )
        this.props.actions.showModal({ body, width: '400px' })
      })
      .then(_ => {
        // TODO: erase history if they go back?
      })
    }
    const historyVal = this.history[historyKey]
    if (!historyVal) return

    this.startHistoryNav()

    // close lightbox, restore search
    const folder = historyVal.folder
    this.props.actions.isolateAssetId()
    this.props.actions.restoreFolders([folder])
  }

  // We need to detect when the search changes because of navigation (fwd/back buttons)
  // or whether the user modified the query without navigating.
  // Mark us as navigating on the popstate event, and then wait for the query to change.
  // If the query doesn't change after some time, time out and assume user is not navigating
  // To reduce the likelihood of timing out, restart the timer during render() if it's running.

  startHistoryNav = () => {
    clearTimeout(this.historyNav)
    this.historyNav = setTimeout(this.stopHistoryNav, 500)
  }

  stopHistoryNav = () => {
    clearTimeout(this.historyNav)
    this.historyNav = null
  }

  saveHistory = (optFirstTimeHistoryKey) => {
    if (this.historyNav && !optFirstTimeHistoryKey) return
    const { query, similar, order, widgets } = this.props
    this.stopHistoryNav()

    const path = location.pathname + location.search
    const historyKey = optFirstTimeHistoryKey || Date.now().toString()
    const attrs = { similar, widgets, order }
    const folderObj = { search: query, attrs }
    const folder = new Folder(folderObj)
    this.history[historyKey] = { folder }

    // save the search in local storage - for restoring session state on reload
    localStorage.setItem(SESSION_STATE_ITEM, JSON.stringify(folderObj))

    requestAnimationFrame(_ => {
      if (location.hash) {
        history.pushState({}, 'title', `${path}#${historyKey}`)
      } else {
        history.replaceState({}, 'title', `${path}#${historyKey}`)
      }
    })
  }

  componentWillUnmount = () => {
    clearInterval(this.updateAssetsScrollSizeInterval)
    this.updateAssetsScrollSizeInterval = null

    // clear any pending layout
    this.clearAssetsLayoutTimer()
    this.resizer.release()
  }

  componentWillReceiveProps = (nextProps) => {
    this.updateSelectedHashes(nextProps.similar.field, nextProps.selectedIds)
  }

  updateSelectedHashes = (similarField, selectedIds) => {
    if (similarField && similarField.length && selectedIds && selectedIds.size) {
      const ids = new Set([...selectedIds])
      if (this.similarIds && equalSets(ids, this.similarIds) && this.similarField && this.similarField === similarField) return
      this.similarIds = ids
      this.similarField = similarField
      const assetIds = [...ids]
      const fields = [similarField, 'proxies*']
      this.props.actions.similarAssets(assetIds, fields)
    } else {
      this.similarIds = null
      this.props.actions.similarAssets()
    }
  }

  onAssetsScrollScroll = (event) => {
    this.setState({ assetsScrollTop: this.refs.assetsScroll.scrollTop })
    this.updateAssetsScrollSize()
  }

  runAssetsLayout = () => {
    const width = this.state.assetsScrollWidth - 2 * assetsScrollPadding
    if (!width) return

    const { assets, layout, thumbSize, showMultipage, isolatedParent } = this.props
    if (!assets) return

    const assetSizes = assets.map(asset => {
      const width = (asset.proxies && asset.proxies[0].width) || asset.width() || 1
      const height = (asset.proxies && asset.proxies[0].height) || asset.height() || 1
      return { width, height, parentId: asset.parentId(), id: asset.id }
    })

    var { positions, multipage, collapsed } = (_ => {
      const isolatedParentId = isolatedParent && isolatedParent.parentId()
      switch (layout) {
        case 'grid': return ComputeLayout.grid(assetSizes, width, thumbSize, showMultipage, isolatedParentId)
        case 'masonry': return ComputeLayout.masonry(assetSizes, width, thumbSize, showMultipage, isolatedParentId)
      }
    })()

    this.setState({ positions, multipage, collapsed })

    this.clearAssetsLayoutTimer()

    // map asset ids to thumb index, so later we can easily track which thumbs
    // belong to selected asset ids.
    this.positionIndexByAssetId = {}
    for (let i = 0; i < assets.length; i++) {
      this.positionIndexByAssetId[assets[i].id] = i
    }

    if (this.scrollToSelectionAfterLayout) {
      this.scrollToSelection()
    }
    this.scrollToSelectionAfterLayout = false
  }

  queueAssetsLayout = () => {
    this.clearAssetsLayoutTimer()
    this.assetsLayoutTimer = setTimeout(this.runAssetsLayout, 150)
  }

  clearAssetsLayoutTimer = () => {
    if (this.assetsLayoutTimer) clearTimeout(this.assetsLayoutTimer)
    this.assetsLayoutTimer = null
  }

  @keydown('tab')
  scrollToNextSelection () {
    this.scrollToSelection()
  }

  scrollToSelection = () => {
    const { assets, selectedIds } = this.props
    if (!assets.length) return
    if (!selectedIds || selectedIds.size === 0) return

    // layout pending? wait to scroll until layout is done
    if (this.assetsLayoutTimer) {
      this.scrollToSelectionAfterLayout = true
      return
    }

    let selectedPositionIndex = []
    for (let assetId of selectedIds) {
      const positionIndex = this.positionIndexByAssetId[assetId]
      if (positionIndex !== undefined) selectedPositionIndex.push(positionIndex)
    }
    selectedPositionIndex = selectedPositionIndex.sort()
    // If we have selected assets that aren't on the current page, this array
    // may be empty. If so, bail out here.
    if (!selectedPositionIndex.length) return

    const firstIndex = selectedPositionIndex[0]
    const lastIndex = selectedPositionIndex[selectedPositionIndex.length - 1]

    const topPx = this.state.positions[firstIndex].y
    const lastPos = this.state.positions[lastIndex]
    const bottomPx = lastPos.y + lastPos.height

    const selectionHeight = bottomPx - topPx

    // center the selection vertically
    let scrollPx = topPx + selectionHeight / 2 - this.state.assetsScrollHeight / 2

    // if the selection doesn't fit, scroll so the first selected row is
    // at the top of the visible table area
    if (selectionHeight > this.state.assetsScrollHeight) {
      scrollPx = topPx
    }

    requestAnimationFrame(() => {
      if (this.refs.assetsScroll) {
        this.refs.assetsScroll.scrollTop = scrollPx
      }
    })
  }

  clampTableHeight = (tableHeight) => {
    const minTableHeight = 26
    const hardMaxTableHeight = 2000
    const footerEditbarAndPaddingHeight = 180 // No ref available for 'stateless' Footer
    const maxTableHeight = (this.refs.Assets && this.refs.Assets.clientHeight - footerEditbarAndPaddingHeight) || hardMaxTableHeight // worst case: table is too big, but drag handle is on-screen
    var clampedTableHeight = Math.min(maxTableHeight, Math.max(minTableHeight, tableHeight))
    if (!clampedTableHeight || !isFinite(clampedTableHeight)) {
      clampedTableHeight = defaultTableHeight
    }
    return clampedTableHeight
  }

  sortAssets = (field, ascending) => {
    this.props.actions.sortAssets(field, ascending)
  }

  toggleRightSidebar = () => {
    const { actions, rightSidebarIsIconified } = this.props
    actions.iconifyRightSidebar(!rightSidebarIsIconified)
  }

  renderAssets () {
    const { assets, selectedIds, loadedCount, filteredCount, layout, showMultipage,
      parentCounts, parentTotals, origin, thumbSize, query, thumbFieldTemplate, isolatedParent } = this.props
    const { positions, multipage, tableIsResizing } = this.state
    api.setTableIsResizing(tableIsResizing)

    if (!assets || !assets.length) {
      return (
        <div className="assets-layout-empty">
          <div className="assets-layout-icon icon-search"/>
          { query && !query.empty() && <div>No results</div> }
          { query && !query.empty() && <button onClick={this.clearSearch}>Clear Search</button> }
        </div>)
    }

    let assetsScrollParams = {
      className: 'assets-scroll fullWidth flexOn',
      onScroll: this.onAssetsScrollScroll,
      ref: 'assetsScroll',
      style: { padding: `${assetsScrollPadding}px` }
    }
    if (tableIsResizing) {
      // this is to prevent the assets panel from scrolling while table resizing
      assetsScrollParams.style.pointerEvents = 'none'
    }

    return (
      <div {...assetsScrollParams}>
        <Measure>
          {({width, height}) => {
            if (!width || !positions.length) {
              this.queueAssetsLayout()
              return (<div style={{'width': '100%'}}></div>)
            }

            const lastPos = positions[positions.length - 1]
            const layoutHeight = Math.ceil(lastPos.y + lastPos.height)

            // Assets-scroll size is determined by its parent (fit on-screen),
            // and has overflow:scroll
            // Assets-layout's size is determined by its children (content)
            // The size of the scroll bars and scroll extent is
            // controlled (like any scrollable element) by the size ratio
            // of the inner element (Assets-layout) to the scrollable element (Assets-scroll).
            // We don't know the exact dimensions of Assets-layout,
            // because we don't know Pager's height (and we don't want to hard code it
            // in case Pager changes). So we're placing the top & bottom elements, Assets-layout-top
            // and Pager, to force Assets-layout to be the exact size we need to hold all
            // the Thumbs, given the positions we've computed for all the Thumbs.
            // Note the explicit 'top' properties on Assets-layout-top and Pager.

            return (
              <div className={`Assets-layout ${layout}`}>
                <div className='Assets-layout-top' style={{top: 0, width: 0, height: 0}}>&nbsp;</div>
                { assets.map((asset, index) => {
                  const dim = index < positions.length ? positions[index] : { width: 0, height: 0 }
                  const { width, height } = dim
                  // Render only the visible thumbnails
                  if ((assetsScrollPadding + dim.y > this.state.assetsScrollTop + this.state.assetsScrollHeight) ||
                      (assetsScrollPadding + dim.y + height < this.state.assetsScrollTop)) {
                    return null
                  }
                  // Multipage agg optimization -- skip over children of parents with full stacks
                  const isolatedParentId = isolatedParent && isolatedParent.parentId()
                  const parentIds = showMultipage && parentCounts && [...parentCounts.keys()].filter(id => id !== isolatedParentId && parentCounts.get(id) >= 3)
                  if (index === assets.length - 1 && index < positions.length &&
                    loadedCount < filteredCount && (!showMultipage || parentIds) &&
                    this.loaded !== assets.length) {
                    this.loaded = assets.length
                    var nextPageQuery = new AssetSearch(query)
                    nextPageQuery.from = loadedCount
                    nextPageQuery.size = AssetSearch.autoPageSize
                    const force = false
                    const isFirstPage = false
                    this.props.actions.searchAssets(nextPageQuery, null, force, isFirstPage, parentIds)
                  }
                  if (!dim || width <= 0 || height <= 0) return null
                  const parentId = asset.parentId()
                  const indexes = parentId && multipage[parentId]
                  const stackCount = parentId && parentTotals && parentTotals.get(parentId)
                  const showBadge = this.state.badgeId === asset.id
                  const badgeHeight = thumbSize < 100 ? 15 : 25
                  const badge = showMultipage && parentId !== isolatedParentId ? multipageBadges(asset, origin, stackCount) : monopageBadges(asset)
                  const iconBadge = showBadge ? <div className="Thumb-field"><FieldTemplate asset={asset} template={thumbFieldTemplate} extensionOnLeft={false}/></div> : null

                  const pages = indexes && indexes.slice(0, 3).map(index => (
                      page(assets[index], width, height, origin, indexes))) ||
                    [page(asset, width, height, origin)]
                  return (
                    <Thumb isSelected={selectedIds && selectedIds.has(asset.id)}
                           onMouseEnter={e => this.setState({ badgeId: asset.id })}
                           onMouseLeave={e => { if (this.state.badgeId === asset.id) this.setState({ badgeId: null }) }}
                           dim={dim}
                           key={asset.id}
                           assetId={asset.id}
                           pages={pages}
                           badgeHeight={badgeHeight}
                           iconBadge={iconBadge}
                           { ...badge }
                           onClick={event => {
                             // don't scroll assets when we select thumbs. (table selection will scroll)
                             this.skipNextSelectionScroll = true
                             this.select(asset, event)
                           }}
                           onDoubleClick={_ => this.isolateToLightbox(asset)}
                    />
                  )
                })}
                <Pager total={filteredCount}
                       loaded={loadedCount}
                       top={layoutHeight + 12 /* 12 px padding */ }
                       />
              </div>
            )
          }}
        </Measure>
      </div>
    )
  }

  render () {
    const { query, totalCount, tableHeight, showTable, showMultipage,
      layout, thumbSize, assetsCounter, rightSidebarIsIconified, widgets, uxLevel } = this.props
    const { tableIsResizing } = this.state

    // Trigger layout if assets change.
    if (assetsCounter !== this.assetsCounter) {
      this.queueAssetsLayout()

      // Only scroll to selection if we haven't already loaded the selection.
      // Invalidate the auto-load cache each time we have a new bare search.
      if (query.from === undefined) {
        this.loaded = 0
        this.scrollToSelection()
        this.saveHistory()
      }
    }
    this.assetsCounter = assetsCounter
    if (this.historyNav) this.startHistoryNav()

    // If the selection change triggered this update, scroll to the new selection
    if (this.props.selectionCounter !== this.selectionCounter) {
      this.selectionCounter = this.props.selectionCounter
      if (!this.skipNextSelectionScroll) {
        this.scrollToSelection()
      }
      this.skipNextSelectionScroll = false
    }

    const pinnedWidget = uxLevel > 0 && widgets && widgets.findIndex(widget => widget.isPinned) >= 0

    return (
      <div className="Assets" ref="Assets">
        <div className="Assets-workspace">
          <div className="Assets-body">
            {this.renderAssets()}
            { showTable && (
              <div className='Assets-tableResize'
                   onMouseDown={this.tableResizeStart}/>
            )}
            { totalCount > 0 &&
            <Footer
              showMultipage={showMultipage}
              toggleShowMultipage={this.toggleShowMultipage}
              showTable={showTable}
              toggleShowTable={uxLevel > 0 ? this.toggleShowTable : null}
              layout={layout}
              handleLayout={this.changeLayout.bind(this)}
              thumbSize={thumbSize}
              handleThumbSize={this.changeThumbSize.bind(this)}
            /> }
            { totalCount > 0 && showTable && uxLevel > 0 && (
              <Table height={this.clampTableHeight(tableHeight)}
                     tableIsResizing={tableIsResizing}
                     selectFn={this.select}/>
            )}
          </div>
          { pinnedWidget && <div className="Workspace-vertical-separator flexOff"/> }
          { pinnedWidget && (
            <Sidebar onToggle={this.toggleRightSidebar}
                     isRightEdge={true}
                     isIconified={rightSidebarIsIconified}>
              <Racetrack isIconified={rightSidebarIsIconified}/>
            </Sidebar>
          )}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  assetsCounter: state.assets.assetsCounter,
  query: state.assets.query,
  order: state.assets.order,
  parentCounts: state.assets.parentCounts,
  parentTotals: state.assets.parentTotals,
  isolatedParent: state.assets.isolatedParent,
  selectedIds: state.assets.selectedIds,
  selectionCounter: state.assets.selectionCounter,
  totalCount: state.assets.totalCount,
  loadedCount: state.assets.loadedCount,
  filteredCount: state.assets.filteredCount,
  rightSidebarIsIconified: state.app.rightSidebarIsIconified,
  folders: state.folders.all,
  trashedFolders: state.folders.trashedFolders,
  uxLevel: state.app.uxLevel,
  user: state.auth.user,
  userSettings: state.app.userSettings,
  thumbSize: state.app.thumbSize,
  layout: state.app.thumbLayout,
  showTable: state.app.showTable,
  tableHeight: state.app.tableHeight,
  showMultipage: state.app.showMultipage,
  thumbFieldTemplate: state.app.thumbFieldTemplate,
  similar: state.racetrack.similar,
  widgets: state.racetrack.widgets,
  origin: state.auth.origin
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    isolateParent,
    selectAssetIds,
    sortAssets,
    searchAssets,
    similarAssets,
    unorderAssets,
    similar,
    resetRacetrackWidgets,
    restoreFolders,
    selectFolderIds,
    setThumbSize,
    setThumbLayout,
    showTable,
    setTableHeight,
    showMultipage,
    showModal,
    hideModal,
    iconifyRightSidebar,
    saveUserSettings
  }, dispatch)
}))(Assets)
