import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Thumb from '../Thumb'
import Asset from '../../models/Asset'

class Assets extends Component {
  static get propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset))
    }
  }

  static get defaultProps () {
    return {
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      layout: 'masonry',
      showTable: true,
      thumbSize: 128
    }
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
          { assets.map(asset => (<Thumb key={asset.id} asset={asset}/>)) }
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
}))(Assets)
