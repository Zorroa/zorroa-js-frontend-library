import React, { Component, PropTypes } from 'react'
import Measure from 'react-measure'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'
import * as assert from 'assert'

import Thumb, { page, badges } from '../Thumb'
import User from '../../models/User'
import Asset from '../../models/Asset'
import { isolateAssetId, selectAssetIds, sortAssets } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { selectFolderIds } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'
import { setThumbSize, setThumbLayout, showTable, setTableHeight, showMultipage } from '../../actions/appActions'
import Pager from './Pager'
import Footer from './Footer'
import Table from '../Table'
import Editbar from './Editbar'
import SortingSelector from './SortingSelector'
import * as ComputeLayout from './ComputeLayout.js'
import AssetSearch from '../../models/AssetSearch'
import Resizer from '../../services/Resizer'
import { addSiblings, equalSets } from '../../services/jsUtil'
import * as api from '../../globals/api.js'

const assetsScrollPadding = 8
const defaultTableHeight = 300

class Assets extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assetsCounter: PropTypes.number.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    order: PropTypes.arrayOf(PropTypes.object),
    selectedIds: PropTypes.object,
    selectionCounter: PropTypes.number.isRequired,
    totalCount: PropTypes.number,
    thumbSize: PropTypes.number.isRequired,
    layout: PropTypes.string.isRequired,
    showTable: PropTypes.bool.isRequired,
    tableHeight: PropTypes.number.isRequired,
    showMultipage: PropTypes.bool.isRequired,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    protocol: PropTypes.string,
    host: PropTypes.string,
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
      collapsed: 0
    }

    this.newTableHeight = 0
    this.updateAssetsScrollSizeInterval = null
    this.selectionCounter = 0
    this.skipNextSelectionScroll = false
    this.scrollToSelectionAfterLayout = false
    this.assetsLayoutTimer = null
    this.assetsCounter = 0
    this.resizer = null
  }

  // Adjust the selection set for the specified asset using
  // the modifier keys for shift to extend and command to
  // toggle entries. We keep the anchor point for shift-select
  // in local state and must update it when the search changes.
  select = (asset, event) => {
    const { assets, selectedIds, showMultipage, actions } = this.props
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
            if (showMultipage) {
              addSiblings(ids, assets)
            }
          }
        }
      }
      if (!ids) {
        // Nothing in the extended selection set, treat as new selection
        ids = new Set([asset.id])
        if (showMultipage) addSiblings(ids, assets)
        this.setState({lastSelectedId: asset.id})
      }
    } else if (event.metaKey) {
      // Toggle the current asset on or off
      ids = new Set([...selectedIds])
      const siblings = new Set([asset.id])
      if (showMultipage) addSiblings(siblings, assets)
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
      if (showMultipage) addSiblings(ids, assets)
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

  isolateToLightbox (asset) {
    this.props.actions.isolateAssetId(asset.id)
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
  }

  componentWillUnmount = () => {
    clearInterval(this.updateAssetsScrollSizeInterval)
    this.updateAssetsScrollSizeInterval = null

    // clear any pending layout
    this.clearAssetsLayoutTimer()
    this.resizer.release()
  }

  onAssetsScrollScroll = (event) => {
    this.setState({ assetsScrollTop: this.refs.assetsScroll.scrollTop })
    this.updateAssetsScrollSize()
  }

  runAssetsLayout = () => {
    const width = this.state.assetsScrollWidth - 2 * assetsScrollPadding
    if (!width) return

    const { assets, layout, thumbSize, showMultipage } = this.props
    if (!assets) return

    const assetSizes = assets.map(asset => {
      const width = asset.width() || (asset.proxies && asset.proxies[0].width) || 1
      const height = asset.height() || (asset.proxies && asset.proxies[0].height) || 1
      return { width, height, parentId: asset.parentId() }
    })

    var { positions, multipage, collapsed } = (_ => {
      switch (layout) {
        case 'grid': return ComputeLayout.grid(assetSizes, width, thumbSize, showMultipage)
        case 'masonry': return ComputeLayout.masonry(assetSizes, width, thumbSize, showMultipage)
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

  renderAssets () {
    const { assets, selectedIds, totalCount, layout, showMultipage, protocol, host, thumbSize } = this.props
    const { positions, multipage, collapsed, tableIsResizing } = this.state
    api.setTableIsResizing(tableIsResizing)

    if (!assets || !assets.length) {
      return (
        <div className="assets-layout-empty flexCol flexJustifyCenter flexAlignItemsCenter">
          <div className="assets-layout-icon icon-search"/>
          <div>No results</div>
          <button onClick={this.clearSearch}>Clear Search</button>
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
                  const pos = positions[index]
                  // Render only the visible thumbnails
                  if ((!pos) ||
                      (assetsScrollPadding + pos.y > this.state.assetsScrollTop + this.state.assetsScrollHeight) ||
                      (assetsScrollPadding + pos.y + pos.height < this.state.assetsScrollTop)) {
                    return null
                  }
                  const parentId = asset.parentId()
                  const indexes = parentId && multipage[parentId]
                  const dim = positions[index]
                  const { width, height } = dim
                  const badgeHeight = thumbSize < 100 ? 15 : 25
                  const badge = badges(asset, protocol, host, indexes && indexes.length || showMultipage, badgeHeight)
                  const pages = indexes && indexes.slice(0, 3).map(index => (
                      page(assets[index], width, height, protocol, host, indexes))) ||
                    [page(asset, width, height, protocol, host)]
                  return (
                    <Thumb isSelected={selectedIds && selectedIds.has(asset.id)}
                           dim={dim}
                           key={asset.id}
                           pages={pages}
                           badgeHeight={badgeHeight}
                           { ...badge }
                           onClick={event => {
                             // don't scroll assets when we select thumbs. (table selection will scroll)
                             this.skipNextSelectionScroll = true
                             this.select(asset, event)
                           }}
                           onDoubleClick={this.isolateToLightbox.bind(this, asset)}
                    />
                  )
                })}
                <Pager total={totalCount}
                       loaded={assets.length}
                       collapsed={collapsed}
                       onUncollapse={this.uncollapse}
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
    const { assets, totalCount, tableHeight, showTable, showMultipage, layout, thumbSize, assetsCounter, order } = this.props
    const { collapsed, tableIsResizing } = this.state

    // Trigger layout if assets change.
    if (assetsCounter !== this.assetsCounter) this.queueAssetsLayout()
    this.assetsCounter = assetsCounter

    // If the selection change triggered this update, scroll to the new selection
    if (this.props.selectionCounter !== this.selectionCounter) {
      this.selectionCounter = this.props.selectionCounter
      if (!this.skipNextSelectionScroll) {
        this.scrollToSelection()
      }
      this.skipNextSelectionScroll = false
    }

    return (
      <div className="Assets" ref="Assets">
        <Editbar leftSide={<SortingSelector sortAssets={this.props.actions.sortAssets} order={order}/>}/>
        {this.renderAssets()}
        { showTable && (
          <div className='Assets-tableResize'
               onMouseDown={this.tableResizeStart}/>
        )}
        { totalCount > 0 && showTable && (
          <Table height={this.clampTableHeight(tableHeight)}
                 tableIsResizing={tableIsResizing}
                 selectFn={this.select}/>
        )}
        { totalCount > 0 &&
        <Footer
          total={totalCount}
          collapsed={collapsed}
          loaded={assets.length}
          onUncollapse={this.uncollapse}
          showMultipage={showMultipage}
          toggleShowMultipage={this.toggleShowMultipage}
          showTable={showTable}
          toggleShowTable={this.toggleShowTable}
          layout={layout}
          handleLayout={this.changeLayout.bind(this)}
          thumbSize={thumbSize}
          handleThumbSize={this.changeThumbSize.bind(this)}
        /> }
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  assetsCounter: state.assets.assetsCounter,
  query: state.assets.query,
  order: state.assets.order,
  selectedIds: state.assets.selectedIds,
  selectionCounter: state.assets.selectionCounter,
  totalCount: state.assets.totalCount,
  user: state.auth.user,
  userSettings: state.app.userSettings,
  thumbSize: state.app.thumbSize,
  layout: state.app.thumbLayout,
  showTable: state.app.showTable,
  tableHeight: state.app.tableHeight,
  showMultipage: state.app.showMultipage,
  protocol: state.auth.protocol,
  host: state.auth.host
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    selectAssetIds,
    sortAssets,
    resetRacetrackWidgets,
    selectFolderIds,
    setThumbSize,
    setThumbLayout,
    showTable,
    setTableHeight,
    showMultipage,
    saveUserSettings
  }, dispatch)
}))(Assets)
