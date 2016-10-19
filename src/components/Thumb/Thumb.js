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
      selected: PropTypes.bool,
      onClick: PropTypes.func.isRequired,
      onDoubleClick: PropTypes.func.isRequired
    }
  }

  render () {
    const { asset, host, dim, layout, selected, onClick, onDoubleClick } = this.props
    if (!asset.proxies) {
      return <div className="thumb" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    var width, height, fit
    switch (layout) {
      case 'grid':
        width = dim
        height = dim
        fit = 'cover'
        break
      case 'masonry':
      case 'slideshow':
        height = dim
        width = height * asset.aspect()
        fit = 'contain'
        break
      case 'waterfall':
        width = dim
        height = width / asset.aspect()
        fit = 'cover'
        break
    }
    const proxy = asset.closestProxy(width, height)
    const selectedStyle = selected ? { border: '3px solid #73b61c' } : { border: '3px solid transparent' }
    return (
      <img src={proxy.url(host)} width={width} height={height} onDoubleClick={onDoubleClick} />
      <img src={proxy.url(host)} width={width} height={height} style={selectedStyle} onClick={onClick} onDoubleClick={onDoubleClick} />
      <div
        className='assets-thumb'
        style={{
          'backgroundImage': `url(${proxy.url(host)})`,
          'backgroundSize': fit,
          'width': `${width}px`,
          'height':`${height}px`,
        }}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
      />
    )
  }
}

export default connect(state => ({
  host: state.auth.host
}))(Thumb)
