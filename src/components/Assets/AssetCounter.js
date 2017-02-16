import React, { PropTypes } from 'react'

const AssetCounter = (props) => (
  <div className="asset-counter">
    <span className="asset-counter-count">{props.loaded}</span>
    <span className="asset-counter-of"></span>
    <span className="asset-counter-count">{props.total}</span>
    <span className="asset-counter-results"></span>
    { props.collapsed ? <span onClick={props.onUncollapse} className="asset-counter-collapsed">{props.collapsed}</span> : null }
  </div>
)

AssetCounter.propTypes = {
  loaded: PropTypes.number,
  collapsed: PropTypes.number,
  total: PropTypes.number,
  onUncollapse: PropTypes.func
}

export default AssetCounter
