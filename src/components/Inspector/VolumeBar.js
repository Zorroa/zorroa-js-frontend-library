import React, { PropTypes } from 'react'

const VolumeBar = (props) => {
  const volumeX = 130 * props.volume
  const volumeY = 30 - (5 + 20 * props.volume)
  return (
    <div className="VolumeBar">
      <div className="VolumeBar-icon icon-mute"/>
      <div className="VolumeBar-volume">
        <div className="VolumeBar-volume-background">
          <svg width="100%" height="100%">
            <path d="M0 25 L130 25 L130 5 Z" fill="#787a77"/>
            <path d={`M0 25 L${volumeX} 25 L${volumeX} ${volumeY} Z`}
                  fill="#73b61c"/>
          </svg>
        </div>
        <input className="VolumeBar-input" type='range' min={0} max={1} step='any'
               value={props.volume} onChange={props.onVolume}/>
      </div>
      <div className="VolumeBar-icon icon-volume-high"/>
    </div>
  )
}

VolumeBar.propTypes = {
  onVolume: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired
}

export default VolumeBar
