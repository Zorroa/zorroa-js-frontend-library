import React, { PropTypes } from 'react'
import { formatDuration, parseFormattedFloat } from '../../services/jsUtil'
import classnames from 'classnames'

const Duration = (props) => (
  <div className="Duration"
       onClick={ event => {
         event.stopPropagation() // prevent select when toggle video playback
         return props.onClick && props.onClick(event)
       }}
       onDoubleClick={ event => event.stopPropagation() /* prevent lightbox */ }>
    <div className="Duration-playstop-badge">
      { props.playing
        ? (<div className={classnames('Duration-stop', {video: !!props.onClick})} />)
        : (<div className={classnames('Duration-play', {video: !!props.onClick})} />) }
    </div>
    <div className="Duration-duration">
      { formatDuration(parseFormattedFloat(props.duration), props.fps) }
    </div>
  </div>
)

Duration.propTypes = {
  duration: PropTypes.number.isRequired,
  fps: PropTypes.number,
  onClick: PropTypes.func,
  playing: PropTypes.bool
}

export default Duration
