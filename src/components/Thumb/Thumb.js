import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Thumb extends Component {
  static get propTypes () {
    return {
      asset: PropTypes.instanceOf(Asset).isRequired,
      host: PropTypes.string,
      dim: PropTypes.number.isRequired,
      layout: PropTypes.string.isRequired,
      onDoubleClick: PropTypes.func.isRequired
    }
  }

  render () {
    const { asset, host, dim, layout, onDoubleClick } = this.props
    if (!asset.proxies) {
      return <div className="thumb" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    var width, height
    switch (layout) {
      case 'grid':
        width = dim
        height = dim
        break
      case 'masonry':
      case 'slideshow':
        height = dim
        width = height * asset.aspect()
        break
      case 'waterfall':
        width = dim
        height = width / asset.aspect()
        break
    }
    const proxy = asset.closestProxy(width, height)
    return (
      <img src={proxy.url(host)} width={width} height={height} onDoubleClick={onDoubleClick} />
    )
  }
}

export default connect(state => ({
  host: state.auth.host
}))(Thumb)
