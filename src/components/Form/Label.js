import React, { PropTypes } from 'react'
import classnames from 'classnames'

export default function FormLabel (props) {
  const labelClasses = classnames('FormInput', props.className, {
    'FormInput--vertical': props.vertical,
    'FormInput--error': props.error === true
  })

  return (
    <label className={labelClasses}>
      <span className="FormInput__label">
        {props.label}
      </span>
      {props.children}
    </label>
  )
}

FormLabel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  label: PropTypes.string,
  vertical: PropTypes.bool,
  error: PropTypes.bool
}
