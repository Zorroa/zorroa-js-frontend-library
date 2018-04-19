import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

import { PubSub } from '../../services/jsUtil'

export default class Scrubber extends PureComponent {
  static propTypes = {
    shuttler: PropTypes.instanceOf(PubSub),
    status: PropTypes.instanceOf(PubSub),
    currentFrameNumber: PropTypes.number,
    totalFrames: PropTypes.number.isRequired,
    mode: PropTypes.oneOf(['controlbar']),
  }

  state = {
    scrubbedFrameNumber: this.props.currentFrameNumber,
    isMouseDown: false,
    elapsedPercent: 0,
  }

  componentWillMount() {
    if (typeof this.props.status === 'function') {
      this.props.status.on('elapsedPercent', elapsedPercent => {
        this.setState({ elapsedPercent })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentFrameNumber !== this.props.currentFrameNumber) {
      this.setState({
        scrubbedFrameNumber: nextProps.currentFrameNumber,
      })
    }
  }

  scrub = scrubbedFrameNumber => {
    if (typeof this.props.shuttler === 'undefined') {
      console.warn(
        'Scrubbing without a shuttler, no change will be reflected in frame',
      )
      return
    }

    this.props.shuttler.publish('scrub', scrubbedFrameNumber)
  }

  onScrubSubmit = event => {
    event.preventDefault()
    this.scrub(this.state.scrubbedFrameNumber)
  }

  onProgressMouseDown = event => {
    event.preventDefault()
    this.setState({
      isMouseDown: true,
    })
  }

  onProgressMouseUp = event => {
    event.preventDefault()
    this.setState({
      isMouseDown: false,
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
    const scrubbedFrameNumber = Math.round(
      rangePercentTraversed * this.props.totalFrames,
    )

    if (scrubbedFrameNumber === this.props.currentFrameNumber) {
      return
    }

    this.scrub(scrubbedFrameNumber)
  }

  render() {
    const { currentFrameNumber, totalFrames } = this.props
    const { elapsedPercent } = this.state
    const completedPercentage = elapsedPercent
      ? elapsedPercent * 100
      : (currentFrameNumber - 1) / (totalFrames - 1) * 100
    const pastStyle = {
      width: `${completedPercentage}%`,
    }
    const draggerStyle = {
      left: `${completedPercentage}%`,
    }
    const isControlBar = this.props.mode === 'controlbar'

    const draggerClasses = classnames('Scrubber__progress-dragger', {
      'Scrubber__progress-dragger--ended': completedPercentage === 100,
      'Scrubber__progress-dragger--controlbar': isControlBar,
    })
    const progressBarClasses = classnames('Scrubber__progress-bar', {
      'Scrubber__progress-bar--controlbar': isControlBar,
    })

    return (
      <form onSubmit={this.onScrubSubmit} className="Scrubber">
        <div
          className="Scrubber__progress"
          title={`Frame ${currentFrameNumber}`}
          onMouseDown={this.onProgressMouseDown}
          onMouseUp={this.onProgressMouseUp}
          onMouseMove={this.onProgressMouseMove}>
          <div style={draggerStyle} className={draggerClasses} />
          <div
            style={pastStyle}
            className={classnames(
              progressBarClasses,
              'Scrubber__progress-bar--past',
            )}
          />
          <div
            className={classnames(
              progressBarClasses,
              'Scrubber__progress-bar--future',
            )}
          />
        </div>
      </form>
    )
  }
}
