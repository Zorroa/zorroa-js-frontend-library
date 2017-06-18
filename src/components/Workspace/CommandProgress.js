import React, { PropTypes } from 'react'
import ProgressBar from '../ProgressBar'

const CommandProgress = (props) => (
  <div className="CommandProgress">
    <div className="CommandProgress-title">
      Task Processing:
    </div>
    <div className="CommandProgress-subtitle">
      Setting asset permissions
    </div>
    <ProgressBar successPct={props.successPct} errorPct={props.errorPct} />
  </div>
)

CommandProgress.propTypes = {
  successPct: PropTypes.number.isRequired,
  errorPct: PropTypes.number.isRequired
}

export default CommandProgress
