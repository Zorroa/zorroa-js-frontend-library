import PropTypes from 'prop-types'
import React, { Component } from 'react'

import withFlipbook from './FlipbookDownloader'
import Flipbook from './Flipbook'
import ProgressCircle from '../ProgressCircle'
import { PubSub } from '../../services/jsUtil'

class FlipbookPlayer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    children: PropTypes.node,
    frames: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        imageBitmap: PropTypes.instanceOf(window.ImageBitmap),
        number: PropTypes.number.isRequired,
      }),
    ).isRequired,
    totalFrames: PropTypes.number.isRequired,
    loadedPercentage: PropTypes.number.isRequired,
    size: PropTypes.oneOf(['cover', 'contain']),
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub),
    onLoad: PropTypes.func,
    autoPlay: PropTypes.bool,
    defaultFrame: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }

  componentWillReceiveProps(nextProps) {
    if (
      typeof this.props.onLoad === 'function' &&
      // this.props.frames.length !== nextProps.frames.length &&
      // this.props.loadedPercentage !== nextProps.loadedPercentage &&
      (nextProps.loadedPercentage >= 100 && nextProps.frames.length > 0)
    ) {
      this.props.onLoad({
        totalFrames: nextProps.totalFrames,
      })
    }
  }

  render() {
    const {
      loadedPercentage,
      frames,
      totalFrames,
      size,
      shuttler,
      status,
      autoPlay,
      defaultFrame,
      width,
      height,
    } = this.props
    const isLoading = loadedPercentage < 100 || frames.length === 0

    return (
      <div className="FlipbookPlayer">
        {this.props.children}
        {isLoading === true && (
          <div className="FlipbookPlayer__loading-status">
            <ProgressCircle percentage={loadedPercentage} />
          </div>
        )}
        {isLoading === false && (
          <Flipbook
            frames={frames}
            totalFrames={totalFrames}
            size={size}
            status={status}
            shuttler={shuttler}
            autoPlay={autoPlay}
            defaultFrame={defaultFrame}
            height={height}
            width={width}
          />
        )}
      </div>
    )
  }
}

export default withFlipbook(FlipbookPlayer)
