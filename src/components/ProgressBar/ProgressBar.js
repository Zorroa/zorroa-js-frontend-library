import React, { PropTypes } from 'react'
import classnames from 'classnames'

const ProgressBar = (props) => (
  <div className={classnames('ProgressBar', {indeterminate: props.successPct === 0 && props.errorPct === 0})}>
    <div className={classnames('ProgressBar-progress', {hasErrors: props.errorPct > 0})}
         style={{width: `${props.successPct}%`}}/>
    <div className="ProgressErrors-errors" style={{width: `${props.errorPct}%`}}/>
  </div>
)

ProgressBar.propTypes = {
  successPct: PropTypes.number.isRequired,
  errorPct: PropTypes.number.isRequired
}

export default ProgressBar
