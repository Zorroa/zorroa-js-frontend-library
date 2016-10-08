import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Thumb extends Component {
  static get propTypes () {
    return {
      asset: PropTypes.instanceOf(Asset).isRequired,
      host: PropTypes.string
    }
  }

  bestProxy (asset, width, height) {
    var bestProxy
    var bestDim = Number.MAX_SAFE_INTEGER
    for (var i in asset.proxies) {
      const proxy = asset.proxies[i]
      const x = Math.abs(proxy.width - width)
      const y = Math.abs(proxy.height - height)
      const d = Math.max(x, y)
      if (d < bestDim) {
        bestDim = d
        bestProxy = proxy
      }
    }
    return bestProxy
  }

  render () {
    const { asset, host } = this.props
    if (!asset.proxies) {
      return <div className="proxy" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    const baseURL = 'https://' + host + ':8066/api/v1/ofs/'
    const height = 150
    const width = height * asset.aspect()
    const proxy = this.bestProxy(asset, width, height)
    return (
      <img src={baseURL + proxy.id} width={width} height={height} />
    )
  }
}

export default connect(state => ({
  host: state.auth.host
}))(Thumb)
