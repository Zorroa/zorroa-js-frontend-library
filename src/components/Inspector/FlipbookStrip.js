import React, { Component, PropTypes } from 'react'
import CanvasImage from '../CanvasImage'
import { PubSub } from '../../services/jsUtil'

export default class FlipbookViewer extends Component {
  static propTypes = {
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    shuttler: PropTypes.instanceOf(PubSub).isRequired,
    totalFrames: PropTypes.number.isRequired,
    currentFrameNumber: PropTypes.number.isRequired
  }

  scrub (frameNumber) {
    this.props.shuttler.publish('scrub', frameNumber)
  }

  render () {
    const element = this.element
    const { currentFrameNumber, frames } = this.props

    if (element !== undefined && frames.length > 0) {
      element.scrollTo((element.scrollWidth - element.offsetWidth) * (currentFrameNumber / frames.length), 0)
    }

    return (
      <div className="FlipbookStrip" ref={ (element) => { this.element = element } }>
        { frames.map(frame => {
          return (
            <CanvasImage
              key={frame.number}
              onClick={() => { this.scrub(frame.number) }}
              className="FlipbookStrip__frame-canvas"
              image={frame.imageBitmap}
              size="cover"
            />
          )
        }) }
      </div>
    )
  }
}
