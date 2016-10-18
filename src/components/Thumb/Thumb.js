import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Thumb extends Component {
  static propTypes = {
    asset         : PropTypes.instanceOf(Asset).isRequired,
    host          : PropTypes.string,
    onDoubleClick : PropTypes.func.isRequired
  }

  render () {
    const { asset, host, onDoubleClick } = this.props
    if (!asset.proxies) {
      return <div className="proxy" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    const height = 150
    const width = height * asset.aspect()
    const proxy = asset.closestProxy(width, height)
    return (
      <img src={proxy.url(host)} width={width} height={height} onDoubleClick={onDoubleClick} />
    )
  }
}

export default connect(state => ({
  host: state.auth.host
}))(Thumb)
