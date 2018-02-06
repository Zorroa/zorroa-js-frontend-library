import React, { Component, PropTypes } from 'react'

import withFlipbook from './FlipbookDownloader'
import Flipbook from './Flipbook'
import ProgressCircle from '../ProgressCircle'
import { PubSub } from '../../services/jsUtil'

class FlipbookPlayer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    children: PropTypes.node,
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    totalFrames: PropTypes.number.isRequired,
    loadedPercentage: PropTypes.number.isRequired,
    size: PropTypes.oneOf(['cover', 'contain']),
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub)
  }

  render () {
    const {
      loadedPercentage,
      frames,
      totalFrames,
      size,
      shuttler,
      status
    } = this.props
    const isLoading = loadedPercentage < 100 || frames.length === 0

    return (
      <div className="FlipbookPlayer">
        {this.props.children}
        { isLoading === true && (
          <div className="FlipbookPlayer__loading-status">
            <ProgressCircle percentage={ loadedPercentage } />
          </div>
        )}
        { isLoading === false && (
          <Flipbook
            fps={30}
            frames={frames}
            totalFrames={totalFrames}
            size={size}
            status={status}
            shuttler={shuttler}
          />
        )}
      </div>
    )
  }
}

export default withFlipbook(FlipbookPlayer)
