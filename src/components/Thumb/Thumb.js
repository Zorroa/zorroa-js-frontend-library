import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Thumb extends Component {
  static get propTypes () {
    return {
      asset: PropTypes.instanceOf(Asset).isRequired,
      host: PropTypes.string,
      dim: PropTypes.object.isRequired,
      selected: PropTypes.bool,
      onClick: PropTypes.func.isRequired,
      onDoubleClick: PropTypes.func.isRequired
    }
  }

  render () {
    const { asset, host, dim, selected, onClick, onDoubleClick } = this.props
    if (!asset.proxies) {
      return <div className="thumb" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    const proxy = asset.closestProxy(dim.width, dim.height)
    return (
      <div
        className='assets-thumb'
        style={{
          'backgroundImage': `url(${proxy.url(host)})`,
          'backgroundSize': 'cover',
          'width': dim.width,
          'height': dim.height,
          'left': dim.x,
          'top': dim.y,
          'border': selected ? '3px solid #73b61c' : 'none'
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
