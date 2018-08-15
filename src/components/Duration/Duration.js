import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { formatDuration, parseFormattedFloat } from '../../services/jsUtil'
import { Flipbook as FlipbookIcon } from '../Icons'
import classnames from 'classnames'

export default class Duration extends PureComponent {
  static propTypes = {
    duration: PropTypes.number,
    isFlipbookDuration: PropTypes.bool,
    frameCount: PropTypes.number,
    fps: PropTypes.number,
    onClick: PropTypes.func,
    playing: PropTypes.bool,
  }

  onClick = event => {
    // prevent selecting the asset when the user is interaction with the Duration component
    event.stopPropagation()

    if (typeof this.props.onClick === 'function') {
      this.props.onClick(event)
    }
  }

  onDoubleClick = event => {
    // Stops lightbox from opening
    event.stopPropagation()
  }

  render() {
    const isFlipbookDuration = this.props.isFlipbookDuration === true
    return (
      <div
        className="Duration"
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}>
        {isFlipbookDuration && (
          <div className="Duration__icon" title="Flipbook">
            <FlipbookIcon />
          </div>
        )}
        {typeof this.props.onClick === 'function' &&
          isFlipbookDuration === false && (
            <div className="Duration__playstop-badge">
              {this.props.playing ? (
                <div
                  className={classnames('Duration__stop', {
                    video: !!this.props.onClick,
                  })}
                />
              ) : (
                <div
                  className={classnames('Duration__play', {
                    video: !!this.props.onClick,
                  })}
                />
              )}
            </div>
          )}
        {this.props.duration !== undefined && (
          <div className="Duration__duration">
            {formatDuration(
              parseFormattedFloat(this.props.duration),
              this.props.fps,
            )}
          </div>
        )}
        {this.props.frameCount && (
          <div
            className="Duration__frame-count"
            title={`${this.props.frameCount} frames in flipbook`}>
            {this.props.frameCount}
          </div>
        )}
      </div>
    )
  }
}
