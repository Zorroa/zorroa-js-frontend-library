import React, { PropTypes } from 'react'

const AssetCounter = (props) => (
  <div className="asset-counter">
    <span className="asset-counter-count">{props.loaded}</span>
    <span className="asset-counter-of"></span>
    <span className="asset-counter-count">{props.total}</span>
    <span className="asset-counter-results"></span>
  </div>
)

AssetCounter.propTypes = {
  loaded: PropTypes.number,
  total: PropTypes.number
}

export default AssetCounter
