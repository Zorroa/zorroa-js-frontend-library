import PropTypes from 'prop-types'
import React, { Component } from 'react'
import CanvasImage from '../CanvasImage'
import { PubSub } from '../../services/jsUtil'

function resize(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio * 100) / 100,
    height: Math.round(srcHeight * ratio * 100) / 100,
  }
}

export default class FlipbookStrip extends Component {
  static propTypes = {
    frames: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        imageBitmap: PropTypes.instanceOf(window.ImageBitmap),
        number: PropTypes.number.isRequired,
      }),
    ).isRequired,
    shuttler: PropTypes.instanceOf(PubSub).isRequired,
    status: PropTypes.instanceOf(PubSub).isRequired,
    totalFrames: PropTypes.number.isRequired,
    currentFrameNumber: PropTypes.number.isRequired,
  }

  state = {
    elapsedPercent: 0,
  }

  componentWillMount() {
    this.props.status.on('playing', isPlaying => {
      if (isPlaying === false) {
        this.scroll()
      }
    })
    this.props.status.on('elapsedPercent', elapsedPercent => {
      this.setState({
        elapsedPercent,
      })
    })
  }

  componentDidMount() {
    this.scroll()
  }

  scroll() {
    const { frames, currentFrameNumber } = this.props
    const element = this.element
    const { elapsedPercent } = this.state

    if (element !== undefined && frames.length > 0) {
      element.scrollTo(
        element.scrollWidth *
          (elapsedPercent || currentFrameNumber / this.props.totalFrames || 0),
        0,
      )
    }
  }

  scrub(frameNumber) {
    this.props.shuttler.publish('scrub', frameNumber)
  }

  render() {
    const { frames } = this.props

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
                title={`Frame no. ${frame.number.toLocaleString()}`}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
