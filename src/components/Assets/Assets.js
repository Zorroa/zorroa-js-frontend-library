import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Thumb from '../Thumb'
import Asset from '../../models/Asset'
import { isolateAsset } from '../../actions/assetsAction'

class Assets extends Component {
  static get propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
      isolateAsset: PropTypes.func.isRequired
    }
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  constructor (props) {
    super(props)
    this.state = {
      layout: 'masonry',
      showTable: true,
      thumbSize: 128
    }
  }

  handleIsolateAsset (asset) {
    this.props.actions.isolateAsset(asset.id)
    this.context.router.push('/lightbox')
  }

  renderAssets (assets) {
    if (!assets || !assets.length) {
      return (<div className="assets-layout-empty">No asset proxies</div>)
    }
    const classNames = classnames('assets-layout', {
      'grid': this.state.layout === 'grid',
      'masonry': this.state.layout === 'masonry',
      'waterfall': this.state.layout === 'waterfall'
    })
    return (
      <div className="assets-scroll">
        <div className={classNames}>
          { assets.map(asset => (<Thumb key={asset.id} asset={asset} onDoubleClick={this.handleIsolateAsset.bind(this, asset)} />)) }
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className="assets-layout">
        {this.renderAssets(this.props.assets)}
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all
}), dispatch => ({
  actions: bindActionCreators({ isolateAsset }, dispatch)
}))(Assets)
