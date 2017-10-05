import React, { PropTypes } from 'react'
import { formatDuration, parseFormattedFloat } from '../../services/jsUtil'

const Duration = (props) => (
  <div className="Duration">
    <div className="Duration-playstop-badge" onClick={e => { e.preventDefault(); return props.onClick && props.onClick(e) }}>
      { props.playing ? (<div className="Duration-stop" />) : (<div className="Duration-play" />) }
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
