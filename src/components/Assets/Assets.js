import React, { Component, PropTypes } from 'react'
import Measure from 'react-measure'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'
import classnames from 'classnames'
import * as assert from 'assert'

import Thumb, { page, monopageBadges, multipageBadges } from '../Thumb'
import User from '../../models/User'
import Asset from '../../models/Asset'
import { isolateAssetId, selectAssetIds, sortAssets, searchAssets, searchAssetsRequestProm } from '../../actions/assetsAction'
import { resetRacetrackWidgets, similarValues } from '../../actions/racetrackAction'
import { selectFolderIds } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'
import { setThumbSize, setThumbLayout, showTable, setTableHeight, showMultipage } from '../../actions/appActions'
import Pager from './Pager'
import Footer from './Footer'
import Table from '../Table'
import Editbar from './Editbar'
import * as ComputeLayout from './ComputeLayout.js'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import Resizer from '../../services/Resizer'
import TrashedFolder from '../../models/TrashedFolder'
import { addSiblings, equalSets, unCamelCase, makePromiseQueue } from '../../services/jsUtil'
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
    folders: PropTypes.instanceOf(Map),
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    similarField: PropTypes.string,
    similarValues: PropTypes.arrayOf(PropTypes.string),
    sync: PropTypes.bool.isRequired,
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
      collapsed: 0,
      cachedSelectedIds: null,
      cachedSelectedHashes: null
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

  deselectAll = () => {
    this.props.actions.selectAssetIds(null)
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
    this.updateSelectedHashes(this.props.similarField, this.props.selectedIds)
  }

  componentWillUnmount = () => {
    clearInterval(this.updateAssetsScrollSizeInterval)
    this.updateAssetsScrollSizeInterval = null

    // clear any pending layout
    this.clearAssetsLayoutTimer()
    this.resizer.release()
  }

  componentWillReceiveProps = (nextProps) => {
    this.updateSelectedHashes(nextProps.similarField, nextProps.selectedIds)
  }

  updateSelectedHashes = (similarField, selectedIds) => {
    if (similarField && similarField.length && selectedIds && selectedIds.size) {
      const { cachedSelectedIds } = this.state
      if (cachedSelectedIds && equalSets(selectedIds, cachedSelectedIds)) return
      const dummyDispatch = () => {}
      const mkProm = (query) => {
        return searchAssetsRequestProm(dummyDispatch, query)
          .catch(error => error) // this catch ensures one error doesn't spoil the batch
      }
      const filter = new AssetFilter({terms: {'_id': [...selectedIds]}})
      const fields = [similarField]
      const query = new AssetSearch({filter, fields, size: selectedIds.size})
      makePromiseQueue([query], mkProm, 1 /* limit to one */)
        .then(responses => {
          const assets = responses[0].data.list.map(json => (new Asset(json)))
          const cachedSelectedHashes = assets.map(asset => (asset.rawValue(similarField)))
          return this.setState({cachedSelectedHashes})
        })

      // Update state now to avoid re-sending
      this.setState({cachedSelectedIds: new Set(selectedIds)})
    } else {
      // Clear the cache
      const cachedSelectedIds = null
      const cachedSelectedHashes = null
      this.setState({cachedSelectedIds, cachedSelectedHashes})
    }
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
      const width = (asset.proxies && asset.proxies[0].width) || asset.width() || 1
      const height = (asset.proxies && asset.proxies[0].height) || asset.height() || 1
      return { width, height, parentId: asset.parentId(), id: asset.id }
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
    this.loaded = 0
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

  sortSimilar = () => {
    const { cachedSelectedHashes } = this.state
    this.props.actions.similarValues(cachedSelectedHashes)
    console.log('Sort by similar: ' + JSON.stringify(cachedSelectedHashes))
  }

  renderEditbar () {
    const { order, selectedIds, similarField, similarValues, query, sync } = this.props
    const { cachedSelectedHashes } = this.state

    const similarActive = similarField && similarField.length > 0 && similarValues && similarValues.length > 0
    let similarValuesSelected = similarValues && cachedSelectedHashes && equalSets(new Set([...similarValues]), new Set([...cachedSelectedHashes]))

    // Only enable similar button if selected assets have the right hash
    let canSortSimilar = selectedIds && selectedIds.size > 0 && similarField && similarField.length > 0 && !similarValuesSelected && cachedSelectedHashes && cachedSelectedHashes.length > 0
    const sortSimilar = canSortSimilar ? this.sortSimilar : null

    const columnName = order && order.length && order[0].field !== 'source.filename' ? unCamelCase(Asset.lastNamespace(order[0].field)) : 'Table Column'

    const loader = require('./loader-rolling.svg')
    const syncer = sync ? <div className="Assets-loading sync"/> : <img className="Assets-loading" src={loader}/>

    return (
      <Editbar selectedAssetIds={selectedIds}
               onDeselectAll={this.deselectAll}>
        { syncer }
        <div className="SortingSelector">
          <div className="SortingSelector-title">Sort By</div>
          <div onClick={this.sortAssets}
               className={classnames('SortingSelector-sort',
                 {'SortingSelector-selected': !similarActive &&
                 (!order || !order.length)})}>
            { !query || query.empty() ? 'Latest' : 'Rank' }
          </div>
          { similarField && similarField.length > 0 &&
          <div onClick={sortSimilar} className="SortingSelector-similar">
            { sortSimilar && similarActive && !similarValuesSelected && selectedIds && selectedIds.size > 0 &&
            <div onClick={sortSimilar}
                 className="SortingSelector-icon icon-settings_backup_restore">&thinsp;</div> }
            <div className={classnames('SortingSelector-sort',
              { 'SortingSelector-selected': similarActive })}>
              Similar
            </div>
          </div>
          }
          { !similarField || !similarField.length &&
          <div onClick={e => { this.sortAssets('source.filename', true) }}
               className={classnames('SortingSelector-sort',
                 {'SortingSelector-enabled': order && order.length >= 1 &&
                 order[0].field === 'source.filename'})}>
            Alphabetical {order && order.length >= 1 && order[0].field === 'source.filename' && !order[0].ascending ? '(Z-A)' : '(A-Z)'}
          </div>
          }
          <div className={classnames('SortingSelector-sort',
            {'SortingSelector-selected': order && order.length && order[0].field !== 'source.filename'},
            {'SortingSelector-disabled': !order || !order.length || order[0].field === 'source.filename'})}>
            {columnName}
          </div>
        </div>
      </Editbar>
    )
  }

  renderAssets () {
    const { assets, selectedIds, totalCount, layout, showMultipage, protocol, host, thumbSize, query } = this.props
    const { positions, multipage, tableIsResizing } = this.state
    api.setTableIsResizing(tableIsResizing)

    if (!assets || !assets.length) {
      return (
        <div className="assets-layout-empty flexCol flexJustifyCenter flexAlignItemsCenter">
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
                  if (index < positions.length && index === assets.length - 1 && assets.length < totalCount &&
                    assets.length % AssetSearch.maxPageSize && this.loaded !== assets.length) {
                    this.loaded = assets.length
                    var nextPageQuery = new AssetSearch(query)
                    nextPageQuery.from = assets.length
                    nextPageQuery.size = AssetSearch.autoPageSize
                    console.log('Loading ' + nextPageQuery.size + ' from ' + nextPageQuery.from)
                    this.props.actions.searchAssets(nextPageQuery)
                  }
                  if (!dim || width <= 0 || height <= 0) return null
                  const parentId = asset.parentId()
                  const indexes = parentId && multipage[parentId]
                  const badgeHeight = thumbSize < 100 ? 15 : 25
                  const badge = showMultipage ? multipageBadges(asset, protocol, host, indexes && indexes.length) : monopageBadges(asset)
                  const pages = indexes && indexes.slice(0, 3).map(index => (
                      page(assets[index], width, height, protocol, host, indexes))) ||
                    [page(asset, width, height, protocol, host)]
                  return (
                    <Thumb isSelected={selectedIds && selectedIds.has(asset.id)}
                           dim={dim}
                           key={asset.id}
                           assetId={asset.id}
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
    const { assets, totalCount, tableHeight, showTable, showMultipage, layout, thumbSize, assetsCounter } = this.props
    const { collapsed, tableIsResizing } = this.state

    // Trigger layout if assets change.
    if (assetsCounter !== this.assetsCounter) {
      this.queueAssetsLayout()
      this.scrollToSelection()
    }
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
        {this.renderEditbar()}
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
  folders: state.folders.all,
  trashedFolders: state.folders.trashedFolders,
  sync: state.auth.sync,
  user: state.auth.user,
  userSettings: state.app.userSettings,
  thumbSize: state.app.thumbSize,
  layout: state.app.thumbLayout,
  showTable: state.app.showTable,
  tableHeight: state.app.tableHeight,
  showMultipage: state.app.showMultipage,
  similarField: state.racetrack.similarField,
  similarValues: state.racetrack.similarValues,
  protocol: state.auth.protocol,
  host: state.auth.host
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    selectAssetIds,
    sortAssets,
    searchAssets,
    searchAssetsRequestProm,
    resetRacetrackWidgets,
    similarValues,
    selectFolderIds,
    setThumbSize,
    setThumbLayout,
    showTable,
    setTableHeight,
    showMultipage,
    saveUserSettings
  }, dispatch)
}))(Assets)
