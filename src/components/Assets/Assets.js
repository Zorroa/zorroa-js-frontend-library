import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'

import Thumb from '../Thumb'
import Asset from '../../models/Asset'
import { isolateAsset, selectAssets } from '../../actions/assetsAction'
import Pager from './Pager'
import Footer from './Footer'
import Table from '../Table'

class Assets extends Component {
  static get propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
      selectedIds: PropTypes.object,
      totalCount: PropTypes.number,
      actions: PropTypes.object
    }
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
      lastSelectedId: null
    }
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
            ids = new Set ()
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
        this.setState({...this.state, lastSelectedId: asset.id })
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
      this.setState({...this.state, lastSelectedId })
    } else {
      // Select the single asset and use it as the anchor point
      ids =  new Set([asset.id])
      this.setState({...this.state, lastSelectedId: asset.id })
    }
    actions.selectAssets(ids)
  }

  isolateToLightbox (asset) {
    this.props.actions.isolateAsset(asset.id)
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

  renderAssets () {
    const { assets, selectedIds, totalCount } = this.props
    const { layout, thumbSize } = this.state

    if (!assets || !assets.length) {
      return (<div className="assets-layout-empty">No asset proxies</div>)
    }

    return (
      <div className="assets-scroll fullWidth fullHeight">
        <div className={`assets-layout ${layout}`}>
          { assets.map(asset => (<Thumb selected={selectedIds && selectedIds.has(asset.id)} dim={thumbSize} layout={layout} key={asset.id} asset={asset} onClick={this.select.bind(this, asset)} onDoubleClick={this.isolateToLightbox.bind(this, asset)} />)) }
        </div>
        { assets.length < totalCount && (<Pager total={totalCount} loaded={assets.length} />) }
      </div>
    )
  }

  render () {
    const { assets, totalCount } = this.props
    const { showTable, layout, thumbSize } = this.state
    return (
      <div className="assets-container flexOff flexCol fullHeight fullWidth">
        {this.renderAssets()}
        { showTable && <Table/> }
        { totalCount &&
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
  actions: bindActionCreators({ isolateAsset, selectAssets }, dispatch)
}))(Assets)
