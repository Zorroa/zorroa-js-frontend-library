import PropTypes from 'prop-types'
import React from 'react'

const AssetCounter = props => (
  <div className="asset-counter">
    <span className="asset-counter-count asset-counter-loaded">
      {props.loaded - props.collapsed}
    </span>
    <span className="asset-counter-of" />
    <span className="asset-counter-count asset-counter-total">
      {props.total}
    </span>
    <span className="asset-counter-results" />
    {props.collapsed ? (
      <span onClick={props.onUncollapse} className="asset-counter-collapsed">
        {props.collapsed}
      </span>
    ) : null}
  </div>
)

AssetCounter.propTypes = {
  loaded: PropTypes.number,
  collapsed: PropTypes.number,
  total: PropTypes.number,
  onUncollapse: PropTypes.func,
}

export default AssetCounter
