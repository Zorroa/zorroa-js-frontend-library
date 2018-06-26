import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

import { PubSub } from '../../services/jsUtil'

const UNDEFINED_SHUTTLER_WARNING =
  'Scrubbing without a shuttler, no change will be reflected in frame'

export default class Scrubber extends PureComponent {
  static propTypes = {
    shuttler: PropTypes.instanceOf(PubSub),
    status: PropTypes.instanceOf(PubSub),
    mode: PropTypes.oneOf(['controlbar']),
  }

  state = {
    isMouseDown: false,
    elapsedPercent: 0,
  }

  componentWillMount() {
    if (typeof this.props.status === 'object') {
      this.props.status.on('elapsedPercent', elapsedPercent => {
        this.setState({ elapsedPercent })
      })
    }
  }

  scrubByPercent = percent => {
    if (typeof this.props.shuttler === 'undefined') {
      return console.warn(UNDEFINED_SHUTTLER_WARNING)
    }

    this.props.shuttler.publish('scrubByPercent', percent)
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

    this.scrubByPercent(rangePercentTraversed)
  }

  render() {
    const { elapsedPercent } = this.state
    const completedPercentage = Math.max(0, Math.min(elapsedPercent * 100, 100))

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
      <div className="Scrubber">
        <div
          className="Scrubber__progress"
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
      </div>
    )
  }
}
