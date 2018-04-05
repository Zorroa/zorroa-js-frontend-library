import React, { PropTypes } from 'react'

const ProgressCircle = props => {
  const { percentage, radius, strokeWidth } = props
  const innnerRadius = radius - strokeWidth / 2
  const width = radius * 2
  const height = radius * 2
  const viewBox = `0 0 ${width} ${height}`
  const strokeDasharray = innnerRadius * Math.PI * 2
  const strokeDashoffset = strokeDasharray - strokeDasharray * percentage / 100

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      viewBox={viewBox}
      className="ProgressCircle">
      <circle
        cx={radius}
        cy={radius}
        r={innnerRadius}
        strokeWidth={`${strokeWidth}px`}
        className="background"
      />
      <circle
        cx={radius}
        cy={radius}
        r={innnerRadius}
        strokeWidth={`${strokeWidth}px`}
        style={{ strokeDasharray, strokeDashoffset }}
        className="foreground"
      />
      <text
        x={radius}
        y={radius}
        dy=".4em"
        textAnchor="middle"
        className="text">
        {`${percentage}%`}
      </text>
    </svg>
  )
}

ProgressCircle.defaultProps = {
  radius: 60,
  strokeWidth: 5,
}

ProgressCircle.propTypes = {
  percentage: PropTypes.number.isRequired,
  radius: PropTypes.number,
  strokeWidth: PropTypes.number,
}

export default ProgressCircle
