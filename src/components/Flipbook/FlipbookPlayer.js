import React, { Component, PropTypes } from 'react'

import withFlipbook from './FlipbookDownloader'
import Flipbook from './Flipbook'
import ProgressCircle from '../ProgressCircle'

class FlipbookPlayer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    totalFrames: PropTypes.number.isRequired,
    loadedPercentage: PropTypes.number.isRequired
  }

  render () {
    const {
      loadedPercentage,
      frames,
      totalFrames
    } = this.props
    const isLoading = loadedPercentage < 100 || frames.length === 0

    return (
      <div className="FlipbookPlayer">
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
          />
        )}
      </div>
    )
  }
}

export default withFlipbook(FlipbookPlayer)
