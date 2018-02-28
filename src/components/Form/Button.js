import React, { PropTypes } from 'react'
import classnames from 'classnames'
import './Button.scss'

export default function FormButton (props) {
  const buttonClasses = classnames('FormButton', {
    'FormButton--disabled': props.disabled === true,
    'FormButton--minimal': props.look === 'minimal',
    'FormButton--mini': props.look === 'mini'
  })
  return (
    <button
      className={buttonClasses}
      type={props.type || 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

FormButton.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  look: PropTypes.oneOf(['normal', 'minimal', 'mini']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool
}
