import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import Video from './Video'
import Image from './Image'
import Asset from '../../models/Asset'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    protocol: PropTypes.string,
    host: PropTypes.string,
    thumbSize: PropTypes.number,
    showMultipage: PropTypes.bool,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset))
  }

  render () {
    const { asset, assets, protocol, host, thumbSize, showMultipage } = this.props
    const mediaType = asset.mediaType().toLowerCase()
    const url = asset.url(protocol, host)
    const imageFormats = [ 'jpeg', 'jpg', 'png', 'gif' ]
    let warning = null    // FIXME: move to Lightbar?
    let inspector = null

    if (mediaType.startsWith('image') &&
      imageFormats.findIndex(format => (mediaType.endsWith(format))) >= 0) {
      const parentId = asset.parentId()
      const pages = parentId && assets.filter(a => (a.parentId() === parentId))
      inspector = <Image url={url} assets={pages}/>
    } else if (mediaType.startsWith('video')) {
      inspector = <Video url={url} frames={asset.frames()} frameRate={asset.frameRate()}
                         startFrame={asset.startFrame()} stopFrame={asset.stopFrame()}/>
    } else if (mediaType === 'application/pdf') {
      inspector = <Pdf page={asset.startPage()} thumbSize={thumbSize} multipage={showMultipage}
                       documentInitParameters={{url, withCredentials: true}} />
    } else {
      const proxy = asset.biggestProxy()
      const pages = assets.filter(a => (a.parentId() === asset.parentId()))
      inspector = <Image url={proxy.url(protocol, host)} assets={pages} />
      warning = <div>{proxy.width} x {proxy.height} proxy</div>
    }

    return (
      <div className="Inspector fullWidth fullHeight flexCenter">
        <div className='Inspector-content flexOn'>
          { inspector }
          { warning ? <div className="Inspector-warning">{warning}</div> : null }
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host,
  thumbSize: state.app.thumbSize,
  showMultipage: state.app.showMultipage,
  assets: state.assets.all
}))(Inspector)
