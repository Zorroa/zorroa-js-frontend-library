import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import FlipbookInspector from './ConnectedFlipbookInspector.js'
import VideoInspector from './VideoInspector'
import ImageInspector from './ImageInspector'
import Asset from '../../models/Asset'
import wrapSignedStream from '../SignedStream'

class Inspector extends PureComponent {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    signedAssetUrl: PropTypes.string.isRequired,
    hasSignedUrl: PropTypes.bool.isRequired,
    onNext: PropTypes.func,
    onPrev: PropTypes.func,
    origin: PropTypes.string,
    thumbSize: PropTypes.number,
  }

  state = {
    error: undefined,
  }

  render() {
    const {
      asset,
      origin,
      hasSignedUrl,
      signedAssetUrl,
      thumbSize,
      onNext,
      onPrev,
    } = this.props
    const { error } = this.state
    const mediaType = error ? 'error' : asset.mediaType().toLowerCase()
    const url = signedAssetUrl
    const imageFormats = ['jpeg', 'jpg', 'png', 'gif']
    let warning = null
    let inspector = null

    if (asset.clipType() === 'flipbook') {
      inspector = <FlipbookInspector clipParentId={asset.parentId()} />
    } else if (
      asset.isOfType('image') &&
      imageFormats.findIndex(format => mediaType.endsWith(format)) >= 0
    ) {
      inspector = (
        <ImageInspector url={url} onNextPage={onNext} onPrevPage={onPrev} />
      )
    } else if (asset.isOfType('video') && asset.validVideo()) {
      inspector = (
        <VideoInspector
          url={url}
          backgroundURL={asset.backgroundURL(origin)}
          frames={asset.frames()}
          frameRate={asset.frameRate()}
          startFrame={asset.startFrame()}
          stopFrame={asset.stopFrame()}
          onError={error => this.setState({ error })}
        />
      )
    } else if (asset.isOfType('application/pdf') && asset.pageCount()) {
      const rangeChunkSize = 65536 * 64
      const needsCredentials = hasSignedUrl === false
      const documentInitParameters = {
        url,
        withCredentials: needsCredentials,
        rangeChunkSize,
      }
      inspector = (
        <Pdf
          path={asset.rawValue('source.path')}
          page={asset.startPage()}
          thumbSize={thumbSize}
          documentInitParameters={documentInitParameters}
        />
      )
    } else {
      const message = error
        ? error.code === 4 ? 'Cannot open video file' : error.message
        : asset.isOfType('video') ? 'Invalid video file' : undefined
      const proxy = asset.biggestProxy()
      inspector = <ImageInspector url={asset.largestProxyURL(origin)} />
      warning = (
        <div className="Inspector-proxy">
          <div className="Inspector-proxy">
            {proxy.width} x {proxy.height} proxy
          </div>
          {message && <div className="Inspector-error">{message}</div>}
        </div>
      )
    }

    return (
      <div className="Inspector">
        {inspector}
        {warning ? <div className="Inspector-warning">{warning}</div> : null}
      </div>
    )
  }
}

export default connect(state => ({
  origin: state.auth.origin,
  host: state.auth.host,
  thumbSize: state.app.thumbSize,
}))(wrapSignedStream(Inspector))
