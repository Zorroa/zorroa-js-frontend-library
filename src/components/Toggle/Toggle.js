import React, { PropTypes } from 'react'
import classnames from 'classnames'

const Toggle = ({checked, onChange, disabled, waiting, disabledTitle}) => {
  const isDisabled = disabled === true
  const isWaiting = waiting === true
  const labelClasses = classnames('Toggle', {
    'Toggle--disabled': isDisabled
  })
  const toggleSliderClasses = classnames('Toggle__slider Toggle__slider--round', {
    'Toggle__slider--disabled': isDisabled,
    'Toggle__slider--waiting': isWaiting
  })
  return (
    <label className={labelClasses}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="Toggle__checkbox"
      />
      <div
        className={toggleSliderClasses}
        title={ isDisabled ? disabledTitle : null }
      />
    </label>
  )
}

Toggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  disabledTitle: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  waiting: PropTypes.bool
}

export default Toggle
