import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

import { PubSub } from '../../services/jsUtil'

export default class Scrubber extends PureComponent {
  static propTypes = {
    shuttler: PropTypes.instanceOf(PubSub),
    currentFrameNumber: PropTypes.number,
    totalFrames: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool,
    progress: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      scrubbedFrameNumber: props.currentFrameNumber
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.scrubbedFrameNumber !== nextProps.currentFrameNumber) {
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

  scrub = () => {
    if (typeof this.props.shuttler === undefined) {
      console.warn('Scrubbing without a shuttler, no change will be reflected in frame')
    } else {
      this.props.shuttler.publish('scrub', this.state.scrubbedFrameNumber)
    }
  }

  onScrubSubmit = event => {
    event.preventDefault()
    this.scrub()
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

    const progressBarClasses = classnames('Scrubber__progress-bar', {
      'Scrubber__progress-bar--is-playing': this.props.isPlaying === true
    })

    return (
      <form onSubmit={this.onScrubSubmit} className="Scrubber">
        { this.props.progress === true && (
          <div className="Scrubber__progress" title={`Frame ${currentFrameNumber} of ${totalFrames}`}>
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
            value={this.state.scrubbedFrameNumber}
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
