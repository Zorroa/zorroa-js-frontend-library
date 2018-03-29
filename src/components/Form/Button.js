import React, { PropTypes } from 'react'
import classnames from 'classnames'
import './Button.scss'

export default function FormButton (props) {
  const isNormalLook = props.look === 'normal' || props.look === undefined
  const buttonClasses = classnames('FormButton', {
    'FormButton--disabled': props.disabled === true,
    'FormButton--minimal': props.look === 'minimal',
    'FormButton--error': props.state === 'error',
    'FormButton--mini': props.look === 'mini'
  })
  const buttonStateClasses = classnames('FormButton__state', {
    'FormButton__state--inactive': props.state === undefined,
    'FormButton__state--active': props.state !== undefined,
    'FormButton__state--loading': props.state === 'loading',
    'FormButton__state--success': props.state === 'success',
    'FormButton__state--error': props.state === 'error'
  })
  const buttonLabelClasses = classnames('FormButton__label', {
    'FormButton__label--state-active': props.state !== undefined
  })
  return (
    <button
      className={buttonClasses}
      type={props.type || 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      { (isNormalLook || props.look === 'mini') && (
        <span
          className={buttonStateClasses}
          title={props.state}
        />
      )}
      <span className={buttonLabelClasses}>
        {props.children}
      </span>
    </button>
  )
}

FormButton.propTypes = {
  children: PropTypes.node,
  state: PropTypes.oneOf(['loading', 'success', 'error']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  look: PropTypes.oneOf(['normal', 'minimal', 'mini']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool
}
