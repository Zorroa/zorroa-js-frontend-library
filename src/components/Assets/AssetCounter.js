import React, { PropTypes } from 'react'

const AssetCounter = (props) => (
  <div className="asset-counter">
    <span className="asset-counter-count">{props.loaded}</span>&nbsp;of&nbsp;<span className="asset-counter-count">{props.total}</span>
  </div>
)

AssetCounter.propTypes = {
  loaded: PropTypes.number,
  total: PropTypes.number
}

export default AssetCounter
