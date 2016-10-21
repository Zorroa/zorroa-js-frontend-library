import React, { PropTypes } from 'react'

const AssetCounter = (props) => (
  <div className="asset-counter">
    <span className="asset-counter-count">{props.loaded}</span> of <span className="asset-counter-count">{props.total}</span> RESULTS
  </div>
)

AssetCounter.propTypes = {
  loaded: PropTypes.number,
  total: PropTypes.number
}

export default AssetCounter
