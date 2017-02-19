import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Pdf from './Pdf'
import Video from './Video'
import Image from './Image'
import Multipage from './Multipage'
import Asset from '../../models/Asset'
import { showPages } from '../../actions/appActions'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    protocol: PropTypes.string,
    host: PropTypes.string,
    thumbSize: PropTypes.number,
    actions: PropTypes.object
  }

  showMultipage = () => {
    this.props.actions.showPages(true)
  }

  render () {
    const { asset, protocol, host, thumbSize } = this.props
    const mediaType = asset.mediaType().toLowerCase()
    const url = asset.url(protocol, host)
    const imageFormats = [ 'jpeg', 'jpg', 'png', 'gif' ]
    let warning = null    // FIXME: move to Lightbar?
    let inspector = null

    if (mediaType.startsWith('image') &&
      imageFormats.findIndex(format => (mediaType.endsWith(format))) >= 0) {
      inspector = <Image url={url} onMultipage={this.showMultipage}/>
    } else if (mediaType.startsWith('video')) {
      inspector = <Video url={url} onMultipage={this.showMultipage}
                         frames={asset.frames()} frameRate={asset.frameRate()}
                         startFrame={asset.startFrame()} stopFrame={asset.stopFrame()}/>
    } else if (mediaType === 'application/pdf') {
      inspector = <Pdf page={asset.startPage()} thumbSize={thumbSize}
                       onMultipage={this.showMultipage}
                       documentInitParameters={{url, withCredentials: true}} />
    } else {
      const proxy = asset.biggestProxy()
      inspector = <Image url={proxy.url(protocol, host)} onMultipage={this.showMultipage} />
      warning = <div>{proxy.width} x {proxy.height} proxy</div>
    }

    return (
      <div className="Inspector fullWidth fullHeight flexCenter">
        <div className='Inspector-content flexOn'>
          <Multipage parentId={asset.parentId()}>
            { inspector }
            { warning ? <div className="Inspector-warning">{warning}</div> : null }
          </Multipage>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host,
  thumbSize: state.app.thumbSize
}), dispatch => ({
  actions: bindActionCreators({
    showPages
  }, dispatch)
}))(Inspector)
