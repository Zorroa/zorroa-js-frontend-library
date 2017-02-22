import React, { PropTypes } from 'react'
import { formatDuration, parseFormattedFloat } from '../../services/jsUtil'

const Duration = (props) => (
  <div className="Duration">
    <div className="Duration-play-badge">
      <div className="Duration-arrow-right" />
    </div>
    <div className="Duration-duration">
      { formatDuration(parseFormattedFloat(props.duration)) }
    </div>
  </div>
)

Duration.propTypes = {
  duration: PropTypes.number.isRequired
}

export default Duration
