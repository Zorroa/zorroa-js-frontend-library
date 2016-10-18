import React, { PropTypes } from 'react'
import classnames from 'classnames'

const TableToggle = (props) => (
  <div className="table-toggle">
    <button onClick={props.onClick} className={
      classnames('table-toggle-button', 'icon-list', {
        'table-toggle-enabled': props.enabled
      })
    } />
  </div>
)

TableToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired
}

export default TableToggle
