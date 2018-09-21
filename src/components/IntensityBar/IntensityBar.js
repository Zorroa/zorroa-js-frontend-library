import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

export default function IntensityBar({ intensityPercent, thresholdPercent }) {
  const meterClasses = classnames('IntensityBar__meter', {
    'IntensityBar__meter--threshhold-acquired':
      intensityPercent > thresholdPercent,
  })
  return (
    <div className="IntensityBar">
      <div
        className={meterClasses}
        style={{
          width: `${intensityPercent}%`,
        }}
      />
    </div>
  )
}

IntensityBar.propTypes = {
  intensityPercent: PropTypes.number.isRequired,
  thresholdPercent: PropTypes.number,
}

IntensityBar.defaultProps = {
  thresholdPercent: 50,
}
