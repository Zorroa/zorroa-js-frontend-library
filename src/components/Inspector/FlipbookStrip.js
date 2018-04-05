import React, { Component, PropTypes } from 'react'
import CanvasImage from '../CanvasImage'
import { PubSub } from '../../services/jsUtil'

function resize(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio * 100) / 100,
    height: Math.round(srcHeight * ratio * 100) / 100,
  }
}

export default class FlipbookViewer extends Component {
  static propTypes = {
    frames: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        imageBitmap: PropTypes.instanceOf(window.ImageBitmap),
        number: PropTypes.number.isRequired,
      }),
    ).isRequired,
    shuttler: PropTypes.instanceOf(PubSub).isRequired,
    totalFrames: PropTypes.number.isRequired,
    currentFrameNumber: PropTypes.number.isRequired,
  }

  scrub(frameNumber) {
    this.props.shuttler.publish('scrub', frameNumber)
  }

  render() {
    const element = this.element
    const { currentFrameNumber, frames } = this.props

    if (element !== undefined && frames.length > 0) {
      element.scrollTo(
        (element.scrollWidth - element.offsetWidth) *
          (currentFrameNumber / frames.length),
        0,
      )
    }

    return (
      <div
        className="FlipbookStrip"
        ref={element => {
          this.element = element
        }}>
        <div className="FlipbookStrip__container">
          {frames.map(frame => {
            const size = resize(
              frame.imageBitmap.width,
              frame.imageBitmap.height,
              1000,
              200,
            )

            return (
              <CanvasImage
                key={`${frame.number}-${frame.url}`}
                onClick={() => {
                  this.scrub(frame.number)
                }}
                className="FlipbookStrip__frame-canvas"
                image={frame.imageBitmap}
                size="cover"
                height={size.height}
                width={size.width}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
