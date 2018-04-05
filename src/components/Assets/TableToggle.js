import React, { PropTypes } from 'react'
import classnames from 'classnames'

const TableToggle = props => (
  <div className="TableToggle" title="Show metadata spreadsheet">
    <div
      onClick={props.onClick}
      className={classnames('TableToggle-button Footer__icon', 'icon-table', {
        'Footer__icon--enabled': props.enabled,
      })}
    />
  </div>
)

TableToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
}

export default TableToggle
