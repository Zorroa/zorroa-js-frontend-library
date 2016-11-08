import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    protocol: PropTypes.string,
    host: PropTypes.string
  }

  render () {
    const { asset, protocol, host } = this.props
    const proxy = asset ? asset.closestProxy(1024, 1024) : null
    const inspectorStyle = { 'backgroundSize': 'fit' }
    if (proxy) inspectorStyle['backgroundImage'] = `url(${proxy.url(protocol, host)})`

    return (
      <div className="inspector fullWidth fullHeight flexCenter">
        <div className='inspector-content flexOn' style={inspectorStyle}/><div/>
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host
}))(Inspector)
