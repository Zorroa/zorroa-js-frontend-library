import React, { Component, PropTypes } from 'react'

import Asset from '../../models/Asset'

export default class Proxy extends Component {
  static get propTypes () {
    return {
      asset: PropTypes.instanceOf(Asset).isRequired
    }
  }

  render () {
    const { asset } = this.props
    if (!asset.proxyLevels()) {
      return <div className="proxy" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    return (
      <img src={'https://localhost:8066/api/v1/ofs/' + asset.proxy(2).id} width={150 * asset.aspect()} height='150px' />
    )
  }
}
