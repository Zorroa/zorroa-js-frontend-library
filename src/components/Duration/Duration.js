import React, { PropTypes } from 'react'
import { formatDuration, parseFormattedFloat } from '../../services/jsUtil'
import { Flipbook as FlipbookIcon } from '../Icons'
import classnames from 'classnames'

export default function Duration (props) {
  const isFlipbookDuration = props.frameCount !== undefined
  return (<div className="Duration"
       onClick={ event => {
         event.stopPropagation() // prevent select when toggle video playback
         return props.onClick && props.onClick(event)
       }}
       onDoubleClick={ event => event.stopPropagation() /* prevent lightbox */ }>
     {isFlipbookDuration && (
       <div className="Duration__icon" title="Flipbook">
        <FlipbookIcon />
       </div>
     )}
    <div className="Duration__playstop-badge">
      { props.playing
        ? (<div className={classnames('Duration__stop', {video: !!props.onClick})} />)
        : (<div className={classnames('Duration__play', {video: !!props.onClick})} />) }
    </div>
    {props.duration !== undefined && (
      <div className="Duration__duration">
        { formatDuration(parseFormattedFloat(props.duration), props.fps) }
      </div>
    )}
    {isFlipbookDuration && (
      <div className="Duration__frame-count" title={`${props.frameCount} frames in flipbook`}>
        { props.frameCount }
      </div>
    )}
  </div>)
}

Duration.propTypes = {
  duration: PropTypes.number,
  frameCount: PropTypes.number,
  fps: PropTypes.number,
  onClick: PropTypes.func,
  playing: PropTypes.bool
}
