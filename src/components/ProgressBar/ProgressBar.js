import React, { PropTypes } from 'react'
import classnames from 'classnames'

const ProgressBar = (props) => (
  <div
    className={classnames('ProgressBar', {
      indeterminate: props.forceIndeterminate || (props.successPct === 0 && props.errorPct === 0),
      fast: props.fast === true
    })}
  >
    <div className={classnames('ProgressBar-progress', 'ProgressBar-pct', {squared: props.errorPct > 0 || props.warningPct > 0 || props.pendingPct > 0})}
         style={{width: `${props.successPct}%`}}/>
    <div className={classnames('ProgressBar-errors', 'ProgressBar-pct', {squared: props.warningPct > 0 || props.pendingPct > 0})}
         style={{width: `${props.errorPct}%`}}/>
    <div className={classnames('ProgressBar-warnings', 'ProgressBar-pct', {squared: props.pendingPct > 0})}
         style={{width: `${props.warningPct}%`}}/>
    <div className={classnames('ProgressBar-pending', 'ProgressBar-pct')}
         style={{width: `${props.warningPct}%`}}/>
  </div>
)

ProgressBar.propTypes = {
  successPct: PropTypes.number.isRequired,
  errorPct: PropTypes.number,
  warningPct: PropTypes.number,
  pendingPct: PropTypes.number,
  forceIndeterminate: PropTypes.bool,
  fast: PropTypes.bool
}

ProgressBar.defaultProps = {
  errorPct: 0,
  warningPct: 0,
  pendingPct: 0,
  forceIndeterminate: false,
  fast: false
}

export default ProgressBar
