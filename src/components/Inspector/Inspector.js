import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import Video from './Video'
import Asset from '../../models/Asset'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    protocol: PropTypes.string,
    host: PropTypes.string
  }

  render () {
    const { asset, protocol, host } = this.props
    const mediaType = asset.mediaType().toLowerCase()
    let isVideo = false
    let isPdf = false
    const url = asset.url(protocol, host)
    const inspectorStyle = { 'backgroundSize': 'fit' }
    if (mediaType.startsWith('image')) {
      if (url) inspectorStyle['backgroundImage'] = `url(${url})`
    } else if (mediaType.startsWith('video')) {
      isVideo = true
    } else if (mediaType === 'application/pdf') {
      isPdf = true
    }
    return (
      <div className="inspector fullWidth fullHeight flexCenter">
        <div className='inspector-content flexOn' style={inspectorStyle}>
          { isVideo && <Video url={url} /> }
          { isPdf && <Pdf documentInitParameters={{url, withCredentials: true}} />}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host
}))(Inspector)
