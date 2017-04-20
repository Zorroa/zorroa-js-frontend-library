import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import Video from './Video'
import Image from './Image'
import MultiImage from './MultiImage'
import Multipage from './Multipage'
import Asset from '../../models/Asset'
import { showPages } from '../../actions/appActions'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    origin: PropTypes.string,
    thumbSize: PropTypes.number,
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    actions: PropTypes.object
  }

  showMultipage = () => {
    this.props.actions.showPages(true)
  }

  render () {
    const { asset, origin, thumbSize, pages } = this.props
    const mediaType = asset.mediaType().toLowerCase()
    const url = asset.url(origin)
    const onMultipage = pages && pages.length && this.showMultipage
    const imageFormats = [ 'jpeg', 'jpg', 'png', 'gif' ]
    let warning = null    // FIXME: move to Lightbar?
    let inspector = null
    let field = 'page'

    if (mediaType.startsWith('image') &&
      imageFormats.findIndex(format => (mediaType.endsWith(format))) >= 0) {
      inspector = <Image url={url} onMultipage={onMultipage} />
    } else if (mediaType.startsWith('image') && pages && pages.length) {
      inspector = <MultiImage id={asset.id} parentId={asset.parentId()}
                              onMultipage={onMultipage} />
    } else if (mediaType.startsWith('video')) {
      field = 'frame'
      inspector = <Video url={url} onMultipage={onMultipage}
                         frames={asset.frames()} frameRate={asset.frameRate()}
                         startFrame={asset.startFrame()} stopFrame={asset.stopFrame()}/>
    } else if (mediaType === 'application/pdf') {
      const rangeChunkSize = 65536 * 64
      inspector = <Pdf page={asset.startPage()} thumbSize={thumbSize}
                       onMultipage={onMultipage}
                       documentInitParameters={{url, withCredentials: true, rangeChunkSize}} />
    } else {
      const proxy = asset.biggestProxy()
      inspector = <Image url={asset.largestProxyURL(origin)} onMultipage={onMultipage} />
      warning = <div>{proxy.width} x {proxy.height} proxy</div>
    }

    // Multipage thumbnail ordering based on document type
    const order = [{ field: `source.clip.${field}.start`, ascending: true }]

    return (
      <div className="Inspector fullWidth fullHeight flexCenter">
        <div className='Inspector-content flexOn'>
          <Multipage parentId={asset.parentId()} order={order}>
            { inspector }
            { warning ? <div className="Inspector-warning">{warning}</div> : null }
          </Multipage>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  origin: state.auth.origin,
  host: state.auth.host,
  thumbSize: state.app.thumbSize,
  pages: state.assets.pages
}), dispatch => ({
  actions: bindActionCreators({
    showPages
  }, dispatch)
}))(Inspector)
