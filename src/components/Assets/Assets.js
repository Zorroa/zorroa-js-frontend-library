import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import * as assert from 'assert'

import Thumb from '../Thumb'
import Asset from '../../models/Asset'
import { isolateAsset } from '../../actions/assetsAction'
import Page from '../../models/Page'
import Pager from './Pager'
import Footer from './Footer'
import Table from '../Table'

class Assets extends Component {
  static get propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
      isolateAsset: PropTypes.func,
      lastPage: PropTypes.instanceOf(Page)
    }
  }

  static contextTypes = {
    router: PropTypes.object,
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
      thumbSize: 128
    }
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
    assert.ok(typeof thumbSize == 'number')
    if (this.state.thumbSize !== thumbSize) {
      this.setState({...this.state, thumbSize})
    }
  }

  renderAssets () {
    const { assets, lastPage } = this.props
    const { layout, thumbSize } = this.state
    const classNames = classnames('assets-layout', layout)

    if (!assets || !assets.length) {
      return (<div className="assets-layout-empty">No asset proxies</div>)
    }

    return (
      <div className="assets-scroll">
        <div className={classNames}>
          { assets.map(asset => (<Thumb dim={thumbSize} layout={layout} key={asset.id} asset={asset} onDoubleClick={this.isolateToLightbox.bind(this, asset)} />)) }
        </div>
        { !lastPage.isLast() && (<Pager total={lastPage.totalCount} loaded={lastPage.loaded()} />) }
      </div>
    )
  }

  render () {
    const { lastPage } = this.props
    const { showTable, layout, thumbSize } = this.state
    return (
      <div className="flexCol fullHeight">
        <div className="assets-layout">
          {this.renderAssets()}
        </div>
        { showTable && <Table/> }
        { lastPage &&
        <Footer
          total={lastPage.totalCount}
          loaded={lastPage.loaded()}
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
  lastPage: state.assets.lastPage
}), dispatch => ({
  actions: bindActionCreators({ isolateAsset }, dispatch)
}))(Assets)
