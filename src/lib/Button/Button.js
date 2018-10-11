import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classnames from 'classnames'
import './Button.scss'
import { KEY_COLOR } from '../variables.js'

export default class FormButton extends PureComponent {
  getKeyColor() {
    if (this.props.whiteLabelEnabled === true) {
      return this.props.keyColor
    }

    return ZORROA_COLOR_GREEN_1
  }

  getStyle() {
    const isEnabled = this.props.disabled === false

    if (isEnabled && ['normal', undefined].includes(this.props.look)) {
      const keyColor = this.getKeyColor()
      return {
        backgroundColor: keyColor,
        borderColor: keyColor,
      }
    }
  }

  render() {
    const props = this.props
    const isNormalLook = props.look === 'normal' || props.look === undefined
    const buttonClasses = classnames('FormButton', {
      'FormButton--disabled': props.disabled === true,
      'FormButton--minimal': props.look === 'minimal',
      'FormButton--error': props.state === 'error',
      'FormButton--mini': props.look === 'mini',
      'FormButton--white-label': props.whiteLabelEnabled === true,
    })
    const buttonStateClasses = classnames('FormButton__state', {
      'FormButton__state--inactive': props.state === undefined,
      'FormButton__state--active': props.state !== undefined,
      'FormButton__state--loading': props.state === 'loading',
      'FormButton__state--success': props.state === 'success',
      'FormButton__state--error': props.state === 'error',
    })
    const buttonLabelClasses = classnames('FormButton__label', {
      'FormButton__label--state-active': props.state !== undefined,
      'FormButton__label--mini': props.look === 'mini',
    })
    return (
      <button
        className={buttonClasses}
        type={props.type || 'button'}
        disabled={props.disabled}
        onClick={props.onClick}
        style={this.getStyle()}
        title={props.title}>
        {(isNormalLook || props.look === 'mini') && (
          <span className={buttonStateClasses} title={props.state} />
        )}
        {props.icon !== undefined && (
          <span className="FormButton__icon">{props.icon}</span>
        )}
        <span className={buttonLabelClasses}>{props.children}</span>
      </button>
    )
  }
}

FormButton.propTypes = {
  children: PropTypes.node,
  state: PropTypes.oneOf(['loading', 'success', 'error']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  look: PropTypes.oneOf(['normal', 'minimal', 'mini']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.node,
  keyColor: PropTypes.string.isRequired,
  whiteLabelEnabled: PropTypes.bool.isRequired,
}
