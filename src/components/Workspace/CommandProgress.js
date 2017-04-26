import React, { PropTypes } from 'react'
import classnames from 'classnames'

const CommandProgress = (props) => (
  <div className="CommandProgress">
    <div className="CommandProgress-title">
      Task Processing:
    </div>
    <div className="CommandProgress-subtitle">
      Setting asset permissions
    </div>
    <div className={classnames('CommandProgress-progress-bar', {indeterminate: props.successPct === 0 && props.errorPct === 0})}>
      <div className={classnames('CommandProgress-progress', {hasErrors: props.errorPct > 0})}
           style={{width: `${props.successPct}%`}}/>
      <div className="CommandProgress-errors" style={{width: `${props.errorPct}%`}}/>
    </div>
  </div>
)

CommandProgress.propTypes = {
  successPct: PropTypes.number.isRequired,
  errorPct: PropTypes.number.isRequired
}

export default CommandProgress
