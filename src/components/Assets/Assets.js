import React, { Component, PropTypes } from 'react'
import Measure from 'react-measure'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'
import * as assert from 'assert'

import Thumb from '../Thumb'
import Asset from '../../models/Asset'
import { isolateAssetId, selectAssetIds } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { selectFolderIds } from '../../actions/folderAction'
import Pager from './Pager'
import Footer from './Footer'
import Table from '../Table'
import Editbar from './Editbar'
import * as ComputeLayout from './ComputeLayout.js'

const assetsScrollPadding = 8

class Assets extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    totalCount: PropTypes.number,
    actions: PropTypes.object
  }

  static get contextTypes () {
    return {
      router: PropTypes.object
    }
  }

  constructor (props) {
    super(props)

    // Store layout as local state, not shared in URLs or outside Assets.
    // Requires passing layout info to subcomponents as needed, rather
    // than passing in global app state, which would also force the
    // otherwise simple sub-components to be Redux containers.
    this.state = {
      layout: 'masonry',
      showTable: false,
      thumbSize: 128,
      lastSelectedId: null,
      tableHeight: 300,
      assetsScrollTop: 0,
      assetsScrollHeight: 0,
      assetsScrollWidth: 0,
      tableIsDragging: false,
      positions: []
    }

    this.tableStartY = 0
    this.tableStartHeight = 0
    this.tableDragNeedsProcessing = true
    this.assetsScrollHeight = 0
    this.assetsScrollWidth = 0
  }

  // Adjust the selection set for the specified asset using
  // the modifier keys for shift to extend and command to
  // toggle entries. We keep the anchor point for shift-select
  // in local state and must update it when the search changes.
  select (asset, event) {
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
        this.setState({...this.state, lastSelectedId: asset.id})
      }
    } else if (event.metaKey) {
      // Toggle the current asset on or off
      ids = new Set([...selectedIds])
      if (ids.has(asset.id)) {
        ids.delete(asset.id)
      } else {
        ids.add(asset.id)
      }
      const lastSelectedId = ids.length ? asset.id : null
      this.setState({...this.state, lastSelectedId})
    } else {
      // Select the single asset and use it as the anchor point
      ids = new Set([asset.id])
      this.setState({...this.state, lastSelectedId: asset.id})
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
    this.context.router.push('/lightbox')
  }

  toggleShowTable () {
    this.setState({ ...this.state, showTable: !this.state.showTable })
  }

  changeLayout (layout) {
    if (this.state.layout !== layout) {
      this.setState({...this.state, layout})
    }
  }

  changeThumbSize (thumbSize) {
    assert.ok(typeof thumbSize === 'number')
    if (this.state.thumbSize !== thumbSize) {
      this.setState({...this.state, thumbSize})
    }
  }

  clearSearch = () => {
    this.props.actions.resetRacetrackWidgets()
    this.props.actions.selectFolderIds()
  }

  tableDragStart = (event) => {
    const { tableHeight } = this.state
    this.tableStartY = event.pageY
    this.newTableHeight = tableHeight
    this.tableStartHeight = tableHeight

    var dragIcon = document.createElement('img')
    // hide the drag element using a transparent 1x1 pixel image as a proxy
    dragIcon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    dragIcon.width = 1
    event.dataTransfer.setDragImage(dragIcon, 0, 0)

    this.setState({tableIsDragging: true})
  }

  tableDragUpdate = (event) => {
    if (!event.pageY) return false

    // let's just completely skip events that happen while we're busy
    if (!this.tableDragNeedsProcessing) return false
    this.tableDragNeedsProcessing = false
    const dy = (event.pageY - this.tableStartY)
    this.newTableHeight = Math.min(600, Math.max(200, this.tableStartHeight - dy))
    // wait one frame to handle the event, otherwise events queue up syncronously
    requestAnimationFrame(_ => {
      this.setState({tableHeight: this.newTableHeight}, () => {
        this.tableDragNeedsProcessing = true
      })
      this.updateAssetsScrollSize()
    })

    return false
  }

  tableDragStop = (event) => {
    this.tableDragNeedsProcessing = true
    this.setState({
      tableHeight: this.newTableHeight,
      tableIsDragging: false
    })
    this.queueAssetsLayout()
    return false
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
      if (!this.state.tableIsDragging) this.queueAssetsLayout()
    }
  }

  onAssetsScrollScroll = (event) => {
    this.setState({ assetsScrollTop: this.refs.assetsScroll.scrollTop })
    this.updateAssetsScrollSize()
  }

  runAssetsLayout = () => {
    const width = this.state.assetsScrollWidth - 2 * assetsScrollPadding
    if (!width) return

    const { assets } = this.props
    const { layout, thumbSize } = this.state

    var positions = (_ => {
      switch (layout) {
        case 'grid': return ComputeLayout.grid(assets, width, thumbSize)
        case 'masonry': return ComputeLayout.masonry(assets, width, thumbSize)
      }
    })()

    this.setState({positions})

    if (this.assetsLayoutTimer) clearTimeout(this.assetsLayoutTimer)
    this.assetsLayoutTimer = null
  }

  queueAssetsLayout = () => {
    if (this.assetsLayoutTimer) clearTimeout(this.assetsLayoutTimer)
    this.assetsLayoutTimer = setTimeout(this.runAssetsLayout, 150)
  }

  renderAssets () {
    const { assets, selectedIds, totalCount } = this.props
    const { layout, positions, tableIsDragging } = this.state

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
    if (tableIsDragging) {
      // this is to prevent the assets panel from scrolling while table resizing (dragging)
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

            requestAnimationFrame(this.updateAssetsScrollSize)

            const lastPos = positions[positions.length - 1]
            const layoutHeight = Math.ceil(lastPos.y + lastPos.height)

            return (
              <div className={`Assets-layout ${layout}`}>
                <div className='Assets-layout-top' style={{top: 0, width: 0, height: 0}}>&nbsp;</div>
                { assets.map((asset, index) => {
                  const pos = positions[index]
                  if ((!pos) ||
                      (assetsScrollPadding + pos.y > this.state.assetsScrollTop + this.state.assetsScrollHeight) ||
                      (assetsScrollPadding + pos.y + pos.height < this.state.assetsScrollTop)) {
                    return null
                  }
                  return (
                    <Thumb isSelected={selectedIds && selectedIds.has(asset.id)}
                      dim={positions[index]}
                      key={asset.id}
                      asset={asset}
                      onClick={this.select.bind(this, asset)}
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
    const { assets, totalCount } = this.props
    const { showTable, layout, thumbSize, tableHeight, tableIsDragging } = this.state
    return (
      <div className="Assets">
        <Editbar/>
        {this.renderAssets()}
        { showTable && (
          <div className='Assets-tableDrag'
               draggable={true}
               onDragStart={this.tableDragStart}
               onDrag={this.tableDragUpdate}
               onDragEnd={this.tableDragStop}/>
        )}
        { showTable && (<Table height={tableHeight} tableIsDragging={tableIsDragging}/>) }
        { totalCount > 0 &&
        <Footer
          total={totalCount}
          loaded={assets.length}
          showTable={showTable}
          toggleShowTable={this.toggleShowTable.bind(this)}
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
  selectedIds: state.assets.selectedIds,
  totalCount: state.assets.totalCount
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    selectAssetIds,
    resetRacetrackWidgets,
    selectFolderIds
  }, dispatch)
}))(Assets)
