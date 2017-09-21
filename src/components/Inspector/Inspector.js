import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import Video from './Video'
import Image from './Image'
import Asset from '../../models/Asset'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    onNext: PropTypes.func,
    onPrev: PropTypes.func,
    origin: PropTypes.string,
    thumbSize: PropTypes.number,
    actions: PropTypes.object
  }

  state = {
    error: undefined
  }

  render () {
    const { asset, origin, thumbSize, onNext, onPrev } = this.props
    const { error } = this.state
    const mediaType = error ? 'error' : asset.mediaType().toLowerCase()
    const url = asset.url(origin)
    const imageFormats = [ 'jpeg', 'jpg', 'png', 'gif' ]
    let warning = null
    let inspector = null

    if (mediaType.startsWith('image') &&
      imageFormats.findIndex(format => (mediaType.endsWith(format))) >= 0) {
      inspector = <Image url={url}
                         onNextPage={onNext} onPrevPage={onPrev} />
    } else if (mediaType.startsWith('video')) {
      inspector = <Video url={url} backgroundURL={asset.backgroundURL(origin)}
                         frames={asset.frames()} frameRate={asset.frameRate()}
                         startFrame={asset.startFrame()} stopFrame={asset.stopFrame()}
                         onError={error => this.setState({error})} />
    } else if (mediaType === 'application/pdf') {
      const rangeChunkSize = 65536 * 64
      inspector = <Pdf page={asset.startPage()} thumbSize={thumbSize}
                       documentInitParameters={{url, withCredentials: true, rangeChunkSize}} />
    } else {
      const proxy = asset.biggestProxy()
      inspector = <Image url={asset.largestProxyURL(origin)} />
      warning = (
        <div className="Inspector-proxy">
          <div className="Inspector-proxy">{proxy.width} x {proxy.height} proxy</div>
          { error && <div className="Inspector-error">{error.code === 4 ? 'Cannot open video file' : error.message}</div> }
        </div>
      )
    }

    return (
      <div className="Inspector">
        <div className='Inspector-content'>
          { inspector }
          { warning ? <div className="Inspector-warning">{warning}</div> : null }
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  origin: state.auth.origin,
  host: state.auth.host,
  thumbSize: state.app.thumbSize
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(Inspector)
