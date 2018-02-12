import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

import { PubSub } from '../../services/jsUtil'

export default class Scrubber extends PureComponent {
  static propTypes = {
    shuttler: PropTypes.instanceOf(PubSub),
    currentFrameNumber: PropTypes.number,
    totalFrames: PropTypes.number.isRequired,
    progress: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      scrubbedFrameNumber: props.currentFrameNumber,
      isMouseDown: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.currentFrameNumber !== this.props.currentFrameNumber) {
      this.setState({
        scrubbedFrameNumber: nextProps.currentFrameNumber
      })
    }
  }

  setScrubbedFrameNumber = frameNumber => {
    this.setState({
      scrubbedFrameNumber: frameNumber
    })
  }

  scrub = (scrubbedFrameNumber) => {
    if (typeof this.props.shuttler === undefined) {
      console.warn('Scrubbing without a shuttler, no change will be reflected in frame')
    } else {
      this.props.shuttler.publish('scrub', scrubbedFrameNumber)
    }
  }

  onScrubSubmit = event => {
    event.preventDefault()
    this.scrub(this.state.scrubbedFrameNumber)
  }

  onProgressMouseDown = event => {
    event.preventDefault()
    this.setState({
      isMouseDown: true
    })
  }

  onProgressMouseUp = event => {
    event.preventDefault()
    this.setState({
      isMouseDown: false
    })
  }

  onProgressMouseMove = event => {
    event.preventDefault()

    if (this.state.isMouseDown === false) {
      return
    }

    const rectangle = event.currentTarget.getBoundingClientRect()
    const rangeStart = rectangle.x
    const rangePosition = event.clientX
    const rangeEnd = event.currentTarget.offsetWidth + rectangle.x
    const rangeDistance = rangeEnd - rangeStart

    const rangePercentTraversed = (rangePosition - rangeStart) / rangeDistance
    const scrubbedFrameNumber = Math.round(rangePercentTraversed * this.props.totalFrames)

    if (scrubbedFrameNumber === this.props.currentFrameNumber) {
      return
    }

    this.scrub(scrubbedFrameNumber)
  }

  render () {
    const { currentFrameNumber, totalFrames } = this.props
    const completedPercentage = (currentFrameNumber - 1) / (totalFrames - 1) * 100
    const pastStyle = {
      width: `${completedPercentage}%`
    }
    const draggerStyle = {
      left: `${completedPercentage}%`
    }

    const progressBarClasses = 'Scrubber__progress-bar'

    return (
      <form onSubmit={this.onScrubSubmit} className="Scrubber">
        { this.props.progress === true && (
          <div
            className="Scrubber__progress"
            title={`Frame ${currentFrameNumber} of ${totalFrames}`}
            onMouseDown={this.onProgressMouseDown}
            onMouseUp={this.onProgressMouseUp}
            onMouseMove={this.onProgressMouseMove}
          >
            <div style={draggerStyle} className="Scrubber__progress-dragger" />
            <div style={pastStyle} className={classnames(progressBarClasses, 'Scrubber__progress-bar--past')} />
            <div className={classnames(progressBarClasses, 'Scrubber__progress-bar--future')} />
          </div>
        )}
        <div className="Scruber__frame-jumper">
          Frame
          <input
            type="text"
            className="Scrubber__scrubber-input"
            value={this.state.currentFrameNumber}
            onFocus={() => { typeof this.props.shuttler === 'function' && this.props.shuttler.publish('stop') }}
            onChange={(event) => { this.setScrubbedFrameNumber(event.target.value) }}
            onBlur={this.scrub}
          />
          of {totalFrames}
        </div>
      </form>
    )
  }
}
