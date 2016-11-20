import React, { PropTypes } from 'react'
import classnames from 'classnames'

const TableToggle = (props) => (
  <div className="TableToggle">
    <button onClick={props.onClick} className={
      classnames('TableToggle-button', 'icon-list', {
        'TableToggle-enabled': props.enabled
      })
    } />
  </div>
)

TableToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired
}

export default TableToggle
