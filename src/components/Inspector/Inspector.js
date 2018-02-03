import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import { withFlipbook } from '../Flipbook'
import FlipbookViewer from './FlipbookViewer.js'
import VideoViewer from './VideoViewer'
import Image from './Image'
import Asset from '../../models/Asset'

const FlipbookViewerWrapped = withFlipbook(FlipbookViewer)

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    onNext: PropTypes.func,
    onPrev: PropTypes.func,
    origin: PropTypes.string,
    thumbSize: PropTypes.number
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

    if (asset.clipType() === 'flipbook') {
      inspector = <FlipbookViewerWrapped clipParentId={asset.document.source.clip.parent} />
    } else if (mediaType.startsWith('image') &&
      imageFormats.findIndex(format => (mediaType.endsWith(format))) >= 0) {
      inspector = <Image url={url}
                         onNextPage={onNext} onPrevPage={onPrev} />
    } else if (mediaType.startsWith('video') && asset.validVideo()) {
      inspector = <VideoViewer url={url} backgroundURL={asset.backgroundURL(origin)}
                         frames={asset.frames()} frameRate={asset.frameRate()}
                         startFrame={asset.startFrame()} stopFrame={asset.stopFrame()}
                         onError={error => this.setState({error})} />
    } else if (mediaType === 'application/pdf' && asset.pageCount()) {
      const rangeChunkSize = 65536 * 64
      inspector = <Pdf path={asset.rawValue('source.path')}
                       page={asset.startPage()} thumbSize={thumbSize}
                       documentInitParameters={{url, withCredentials: true, rangeChunkSize}} />
    } else {
      const message = error ? (error.code === 4 ? 'Cannot open video file' : error.message) : (mediaType.startsWith('video') ? 'Invalid video file' : undefined)
      const proxy = asset.biggestProxy()
      inspector = <Image url={asset.largestProxyURL(origin)} />
      warning = (
        <div className="Inspector-proxy">
          <div className="Inspector-proxy">{proxy.width} x {proxy.height} proxy</div>
          { message && <div className="Inspector-error">{message}</div> }
        </div>
      )
    }

    return (
      <div className="Inspector">
        { inspector }
        { warning ? <div className="Inspector-warning">{warning}</div> : null }
      </div>
    )
  }
}

export default connect(state => ({
  origin: state.auth.origin,
  host: state.auth.host,
  thumbSize: state.app.thumbSize
}))(Inspector)
