import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Pdf from './Pdf'
import Video from './Video'
import Image from './Image'
import Asset from '../../models/Asset'
import { parseTimecodeMS } from '../../services/jsUtil'

class Inspector extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset),
    protocol: PropTypes.string,
    host: PropTypes.string
  }

  render () {
    const { asset, protocol, host } = this.props
    const mediaType = asset.mediaType().toLowerCase()
    const url = asset.url(protocol, host)
    const imageFormats = [ 'jpeg', 'jpg', 'png', 'gif' ]
    let warning = null    // FIXME: move to Lightbar?
    let inspector = null

    // [dhart 01/11/2017] REMOVE ASAP
    // This spe bit is a hack assumption for demo day
    // TODO: remove this asap and put in proper video clip detection code
    // Main reason for this is SPE video clips at the time of writing
    // do not have video metadata, they identify as jpg images
    if (asset.document.spe && asset.document.spe.clip) {
      let startTime = asset.document.spe.clip.timecodeStart
      let stopTime = asset.document.spe.clip.timecodeStop
      let startSec = parseTimecodeMS(startTime) / 1000
      let stopSec = parseTimecodeMS(stopTime) / 1000
      inspector = <Video url={url} startSec={startSec} stopSec={stopSec}/>
    } else if (mediaType.startsWith('image') &&
      imageFormats.findIndex(format => (mediaType.endsWith(format))) >= 0) {
      inspector = <Image url={url}/>
    } else if (mediaType.startsWith('video')) {
      inspector = <Video url={url}/>
    } else if (mediaType === 'application/pdf') {
      inspector = <Pdf documentInitParameters={{url, withCredentials: true}} />
    } else {
      const proxy = asset.biggestProxy()
      inspector = <Image url={proxy.url(protocol, host)}/>
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
  host: state.auth.host
}))(Inspector)
