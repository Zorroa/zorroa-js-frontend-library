import React, { PropTypes } from 'react'
import classnames from 'classnames'

const Toggle = ({checked, onChange}) => (
  <label className={classnames('Toggle', {checked})}>
    <input type="checkbox" checked={checked} onChange={onChange}
           className="Toggle-checkbox"/>
    <div className="Toggle-slider round"/>
  </label>
)

Toggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string
}

export default Toggle
