import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Measure from 'react-measure'
import keydown from 'react-keydown'

import Thumb, { page } from '../Thumb'
import User from '../../models/User'
import Asset from '../../models/Asset'
import Widget from '../../models/Widget'
import Pager from './Pager'
import Footer from './Footer/index.js'
import AssetsZeroState from './ZeroState/index.js'
import AssetsTable from './AssetsTable'
import Sidebar from '../Sidebar'
import Racetrack from '../Racetrack'
import * as ComputeLayout from './ComputeLayout.js'
import AssetSearch from '../../models/AssetSearch'
import Resizer from '../../services/Resizer'
import { equalSets } from '../../services/jsUtil'
import Folder from '../../models/Folder'
import {
  SESSION_STATE_ITEM,
  ASSETS_HISTORY,
} from '../../constants/localStorageItems'

const assetsScrollPadding = 8
const defaultTableHeight = 300

export default class Assets extends Component {
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
    rightSidebarIsIconified: PropTypes.bool,
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    uxLevel: PropTypes.number,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    origin: PropTypes.string,
    actions: PropTypes.shape({
      isolateAssetId: PropTypes.func.isRequired,
      isolateParent: PropTypes.func.isRequired,
      selectAssetIds: PropTypes.func.isRequired,
      searchAssets: PropTypes.func.isRequired,
      updateParentTotals: PropTypes.func.isRequired,
      unorderAssets: PropTypes.func.isRequired,
      restoreFolders: PropTypes.func.isRequired,
      selectFolderIds: PropTypes.func.isRequired,
      setThumbSize: PropTypes.func.isRequired,
      setThumbLayout: PropTypes.func.isRequired,
      showTable: PropTypes.func.isRequired,
      setTableHeight: PropTypes.func.isRequired,
      showModal: PropTypes.func.isRequired,
      hideModal: PropTypes.func.isRequired,
      iconifyRightSidebar: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
      showQuickview: PropTypes.func.isRequired,
    }),
    isolatedId: PropTypes.string,
    showQuickview: PropTypes.bool.isRequired,
    history: PropTypes.object,
    location: PropTypes.object,
  }

  constructor(props) {
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
    this.history = this.getHistory()
    this.historyNav = null
  }

  getHistory() {
    let parsedAssetsHistory = {}

    try {
      const rawAssetsHistory = localStorage.getItem(ASSETS_HISTORY)
      parsedAssetsHistory = JSON.parse(rawAssetsHistory)
    } catch (error) {
      // Parse errors and localStorage are expected. If they happen consider that
      // there isn't any history available
    }

    if (parsedAssetsHistory === null) {
      parsedAssetsHistory = {}
    }

    if (typeof parsedAssetsHistory === 'object') {
      return parsedAssetsHistory
    }

    return {}
  }

  setHistory() {
    const recentHistory = Object.keys(this.history).reduce(
      (previousValue, currentValue) => {
        const historyTime = Number(currentValue)
        const maxHistoryAgeSeconds = 60 * 60 * 24
        const currentTimeSeconds = Date.now()
        const isHistoryUnexpired =
          currentTimeSeconds - maxHistoryAgeSeconds < historyTime
        if (isHistoryUnexpired) {
          return {
            [historyTime]: this.history[currentValue],
            ...previousValue,
          }
        }

        return previousValue
      },
      {},
    )
    localStorage.setItem(ASSETS_HISTORY, JSON.stringify(recentHistory))
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
        const lastSelectedIndex = assets.findIndex(a => a.id === lastSelectedId)
        if (lastSelectedIndex >= 0) {
          const index = assets.findIndex(a => a.id === asset.id)
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
        this.setState({ lastSelectedId: asset.id })
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
      this.setState({ lastSelectedId })
    } else {
      ids = new Set([asset.id])
      if (selectedIds && equalSets(ids, selectedIds)) {
        // single click of a single selected asset should deselect
        ids = new Set()
        this.setState({ lastSelectedId: null })
      } else {
        // Select the single asset and use it as the anchor point
        this.setState({ lastSelectedId: asset.id })
      }
    }
    actions.selectAssetIds(ids)
  }

  @keydown('space')
  isolateToQuickview(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }

    if (this.props.showQuickview === true) {
      // Nothing to do here, quick view is already open
      return
    }

    if (this.props.isolatedId) {
      // If something is already isolated don't do anything, it could be
      // isolated to a Lightbox or some other piece of UI
      return
    }

    const { selectedIds } = this.props
    if (selectedIds && selectedIds.size >= 1) {
      const id = selectedIds.values().next().value
      if (id) {
        this.skipNextSelectionScroll = true
        this.props.actions.isolateAssetId(id)
        this.props.actions.showQuickview()
      }
    }
  }

  isolateSelected() {
    const { assets, selectedIds } = this.props
    if (selectedIds && selectedIds.size === 1) {
      const id = selectedIds.values().next().value
      const index = assets.findIndex(a => a.id === id)
      if (index >= 0) {
        this.isolateToLightbox(assets[index])
      }
    }
  }

  isolateToLightbox = asset => {
    const nonIsolatableParentClipTypes = ['flipbook']
    const canIsolateParent = !nonIsolatableParentClipTypes.includes(
      asset.clipType(),
    )
    const { parentTotals, isolatedParent } = this.props
    const parentId = asset.parentId()
    const isolatedParentId = isolatedParent && isolatedParent.parentId()
    const stackCount =
      parentId &&
      parentId !== isolatedParentId &&
      parentTotals &&
      parentTotals.get(parentId)

    if (stackCount > 1 && canIsolateParent) {
      this.props.actions.isolateParent(asset)
      return
    }

    this.props.actions.isolateAssetId(asset.id, this.props.history)
  }

  changeLayout = () => {
    this.queueAssetsLayout()
  }

  tableResizeStart = event => {
    this.resizer.capture(
      this.tableResizeUpdate,
      this.tableResizeStop,
      0,
      this.props.tableHeight,
      0,
      -1,
    )
    const tableHeight = this.clampTableHeight(this.state.tableHeight)
    this.newTableHeight = tableHeight
    this.setState({ tableIsResizing: true })
  }

  tableResizeUpdate = (resizeX, resizeY) => {
    this.newTableHeight = this.clampTableHeight(resizeY)
    // wait one frame to handle the event, otherwise events queue up syncronously
    this.props.actions.setTableHeight(this.newTableHeight)
    this.updateAssetsScrollSize()
  }

  tableResizeStop = event => {
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      tableHeight: this.newTableHeight,
    })
    this.setState({ tableIsResizing: false })
    this.queueAssetsLayout()
  }

  updateAssetsScrollSize = () => {
    const assetsScroll = this.refs.assetsScroll
    if (!assetsScroll) return
    if (
      assetsScroll.clientHeight !== this.state.assetsScrollHeight ||
      assetsScroll.clientWidth !== this.state.assetsScrollWidth
    ) {
      this.setState({
        assetsScrollHeight: assetsScroll.clientHeight,
        assetsScrollWidth: assetsScroll.clientWidth,
      })
      if (!this.state.tableIsResizing) this.queueAssetsLayout()
    }
  }

  componentWillMount() {
    if (this.updateAssetsScrollSizeInterval) {
      clearInterval(this.updateAssetsScrollSizeInterval)
    }
    this.updateAssetsScrollSizeInterval = setInterval(
      this.updateAssetsScrollSize,
      150,
    )
    this.resizer = new Resizer()
    window.addEventListener('popstate', this.restoreHistory)
    this.history = this.getHistory()
  }

  componentWillUnmount = () => {
    clearInterval(this.updateAssetsScrollSizeInterval)
    this.updateAssetsScrollSizeInterval = null

    // clear any pending layout
    this.clearAssetsLayoutTimer()
    this.resizer.release()
    window.removeEventListener('popstate', this.restoreHistory)
    this.setHistory()
  }

  restoreHistory = event => {
    // location has the new URL, after having hit Back or Forward
    const historyKey = location.hash.slice(1)
    const historyVal = this.history[historyKey]
    if (!historyVal) return

    this.startHistoryNav()

    // close lightbox, restore search
    const folder = historyVal.folder
    this.props.actions.isolateAssetId()
    this.props.actions.isolateParent()
    this.props.actions.restoreFolders([folder])
  }

  startHistoryNav = () => {
    clearTimeout(this.historyNav)
    this.historyNav = setTimeout(this.stopHistoryNav, 500)
  }

  stopHistoryNav = () => {
    clearTimeout(this.historyNav)
    this.historyNav = null
  }

  saveHistory = () => {
    if (this.historyNav) {
      return
    }

    const { query, order, widgets } = this.props
    this.stopHistoryNav()

    const path = location.pathname + location.search
    const historyKey = Date.now().toString()
    const attrs = { widgets, order }
    const folderObj = { search: query, attrs }
    const folder = new Folder(folderObj)
    this.history[historyKey] = { folder }

    // save the search in local storage - for restoring session state on reload
    localStorage.setItem(SESSION_STATE_ITEM, JSON.stringify(folderObj))

    requestAnimationFrame(() => {
      if (this.props.location.hash) {
        this.props.history.push(`${path}#${historyKey}`)
      } else {
        this.props.history.replace(`${path}#${historyKey}`)
      }
    })
  }

  onAssetsScrollScroll = event => {
    this.setState({ assetsScrollTop: this.refs.assetsScroll.scrollTop })
    this.updateAssetsScrollSize()
  }

  runAssetsLayout = () => {
    const width = this.state.assetsScrollWidth - 2 * assetsScrollPadding
    if (!width) return

    const {
      query,
      assets,
      layout,
      thumbSize,
      isolatedParent,
      parentTotals,
    } = this.props
    if (!assets) return

    const assetSizes = assets.map(asset => {
      const width =
        (asset.proxies && asset.proxies[0].width) || asset.width() || 1
      const height =
        (asset.proxies && asset.proxies[0].height) || asset.height() || 1
      return { width, height, parentId: asset.parentId(), id: asset.id }
    })

    const isolatedParentId = isolatedParent && isolatedParent.parentId()
    var { positions, multipage, collapsed } = (() => {
      switch (layout) {
        case 'grid':
          return ComputeLayout.grid(
            assetSizes,
            width,
            thumbSize,
            isolatedParentId,
          )
        case 'masonry':
          return ComputeLayout.masonry(
            assetSizes,
            width,
            thumbSize,
            isolatedParentId,
          )
      }
    })()

    // Recompute the parent counts whenever we add new entries
    const a = new Set(Object.keys(multipage))
    const b = new Set(Object.keys(this.state.multipage))
    const parentsModified = !equalSets(a, b)
    this.setState({ positions, multipage, collapsed })
    const parentIds = multipage && Object.keys(multipage)
    const untotaledParentIds = parentIds.filter(
      parentId =>
        parentTotals === undefined || parentTotals.has(parentId) === false,
    )

    if (parentsModified && untotaledParentIds.length > 0) {
      this.props.actions.updateParentTotals(query, untotaledParentIds)
    }

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
  scrollToNextSelection() {
    this.scrollToSelection()
  }

  scrollToPx = scrollPx => {
    requestAnimationFrame(() => {
      if (this.refs.assetsScroll) {
        this.refs.assetsScroll.scrollTop = scrollPx
      }
    })
  }

  scrollToTop = this.scrollToPx.bind(this, 0)

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
    // if the selection doesn't fit, scroll so the first selected row is
    // at the top of the visible table area
    const scrollPx =
      selectionHeight > this.state.assetsScrollHeight
        ? topPx
        : topPx + selectionHeight / 2 - this.state.assetsScrollHeight / 2

    this.scrollToPx(scrollPx)
  }

  clampTableHeight = tableHeight => {
    const minTableHeight = 26
    const hardMaxTableHeight = 2000
    const footerEditbarAndPaddingHeight = 180 // No ref available for 'stateless' Footer
    const maxTableHeight =
      (this.refs.Assets &&
        this.refs.Assets.clientHeight - footerEditbarAndPaddingHeight) ||
      hardMaxTableHeight // worst case: table is too big, but drag handle is on-screen
    var clampedTableHeight = Math.min(
      maxTableHeight,
      Math.max(minTableHeight, tableHeight),
    )
    if (!clampedTableHeight || !isFinite(clampedTableHeight)) {
      clampedTableHeight = defaultTableHeight
    }
    return clampedTableHeight
  }

  toggleRightSidebar = () => {
    const { actions, rightSidebarIsIconified } = this.props
    actions.iconifyRightSidebar(!rightSidebarIsIconified)
  }

  renderAssets() {
    const {
      assets,
      selectedIds,
      loadedCount,
      filteredCount,
      layout,
      parentCounts,
      parentTotals,
      origin,
      thumbSize,
      query,
      isolatedParent,
    } = this.props

    if (!assets || !assets.length) {
      return null
    }

    const { positions, multipage, tableIsResizing } = this.state

    return (
      <div
        className="assets-scroll fullWidth flexOn"
        onScroll={this.onAssetsScrollScroll}
        ref="assetsScroll"
        style={{
          padding: `${assetsScrollPadding}px`,
          pointerEvents: tableIsResizing ? 'none' : 'initial',
        }}>
        <Measure>
          {({ width }) => {
            if (!width || !positions.length) {
              this.queueAssetsLayout()
              return <div style={{ width: '100%' }} />
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
                <div className="Assets-layout-top">&nbsp;</div>
                {assets.map((asset, index) => {
                  const dim =
                    index < positions.length
                      ? positions[index]
                      : { width: 0, height: 0 }
                  const { width, height } = dim
                  // Render only the visible thumbnails
                  if (
                    assetsScrollPadding + dim.y >
                      this.state.assetsScrollTop +
                        this.state.assetsScrollHeight ||
                    assetsScrollPadding + dim.y + height <
                      this.state.assetsScrollTop
                  ) {
                    return null
                  }
                  // Multipage agg optimization -- skip over children of parents with full stacks
                  const isolatedParentId =
                    isolatedParent && isolatedParent.parentId()
                  const parentIds =
                    parentCounts &&
                    [...parentCounts.keys()].filter(
                      id =>
                        id !== isolatedParentId && parentCounts.get(id) >= 3,
                    )
                  if (
                    index === assets.length - 1 &&
                    index < positions.length &&
                    loadedCount < filteredCount &&
                    parentIds &&
                    this.loaded !== assets.length
                  ) {
                    this.loaded = assets.length
                    var nextPageQuery = new AssetSearch(query)
                    nextPageQuery.from = loadedCount
                    nextPageQuery.size = AssetSearch.autoPageSize
                    const force = false
                    const isFirstPage = false
                    this.props.actions.searchAssets(
                      nextPageQuery,
                      null,
                      force,
                      isFirstPage,
                      parentIds,
                      parentTotals,
                    )
                  }
                  if (!dim || width <= 0 || height <= 0) return null
                  const parentId = asset.parentId()
                  const badgeHeight = thumbSize < 100 ? 15 : 25

                  const indexes = parentId && multipage[parentId]
                  const pages = (indexes &&
                    indexes
                      .slice(0, 3)
                      .map(index =>
                        page(assets[index], width, height, origin, indexes),
                      )) || [page(asset, width, height, origin)]
                  return (
                    <Thumb
                      isSelected={selectedIds && selectedIds.has(asset.id)}
                      dim={dim}
                      parentWidth={this.refs.assetsScroll.clientWidth}
                      key={asset.id}
                      asset={asset}
                      assetId={asset.id}
                      pages={pages}
                      badgeHeight={badgeHeight}
                      showMultipageBadges={this.shouldShowMultipageBadges(
                        asset,
                      )}
                      onClick={event => {
                        // don't scroll assets when we select thumbs. (table selection will scroll)
                        this.skipNextSelectionScroll = true
                        this.select(asset, event)
                      }}
                      onDoubleClick={() => this.isolateToLightbox(asset)}
                    />
                  )
                })}
                <Pager
                  total={filteredCount}
                  loaded={loadedCount}
                  top={layoutHeight + 12 /* 12 px padding */}
                />
              </div>
            )
          }}
        </Measure>
      </div>
    )
  }

  shouldShowMultipageBadges(asset) {
    const { isolatedParent } = this.props
    const isolatedParentId = isolatedParent && isolatedParent.parentId()

    return asset.parentId() !== isolatedParentId
  }

  isNewBareSearch() {
    const { query } = this.props
    return query.from === undefined
  }

  hasPinnedWidget() {
    const { uxLevel, widgets } = this.props

    return (
      uxLevel > 0 &&
      widgets &&
      widgets.findIndex(widget => widget.isPinned) >= 0
    )
  }

  hasNoAssets() {
    const assets = this.props.assets
    return !assets || !assets.length
  }

  render() {
    const {
      totalCount,
      tableHeight,
      showTable,
      assetsCounter,
      rightSidebarIsIconified,
    } = this.props
    const { tableIsResizing } = this.state

    // Trigger layout if assets change.
    if (assetsCounter !== this.assetsCounter) {
      this.queueAssetsLayout()

      // Only scroll to selection if we haven't already loaded the selection.
      // Invalidate the auto-load cache each time we have a new bare search.
      if (this.isNewBareSearch()) {
        this.loaded = 0
        this.saveHistory()
        this.scrollToTop()
      }
    }
    this.assetsCounter = assetsCounter
    if (this.historyNav) {
      this.startHistoryNav()
    }

    // If the selection change triggered this update, scroll to the new selection
    if (this.props.selectionCounter !== this.selectionCounter) {
      this.selectionCounter = this.props.selectionCounter
      if (!this.skipNextSelectionScroll) {
        this.scrollToSelection()
      }
      this.skipNextSelectionScroll = false
    }

    const pinnedWidget = this.hasPinnedWidget()

    return (
      <div className="Assets">
        <div className="Assets-workspace">
          <div className="Assets-body">
            {this.renderAssets()}
            <AssetsZeroState />
            {showTable && (
              <div
                className="Assets-tableResize"
                onMouseDown={this.tableResizeStart}
              />
            )}
            {totalCount > 0 && <Footer handleLayout={this.changeLayout} />}
            {totalCount > 0 &&
              showTable && (
                <AssetsTable
                  height={this.clampTableHeight(tableHeight)}
                  tableIsResizing={tableIsResizing}
                  selectFn={this.select}
                />
              )}
          </div>
          {pinnedWidget && (
            <div className="Workspace-vertical-separator flexOff" />
          )}
          {pinnedWidget && (
            <Sidebar
              onToggle={this.toggleRightSidebar}
              isRightEdge={true}
              isIconified={rightSidebarIsIconified}>
              <Racetrack isIconified={rightSidebarIsIconified} />
            </Sidebar>
          )}
        </div>
      </div>
    )
  }
}
