import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import './Button.scss'
import { ZORROA_COLOR_GREEN_1 } from '../variables.js'

export default class Button extends Component {
  getKeyColor() {
    return this.props.keyColor
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
    const buttonClasses = classnames('Button', {
      'Button--disabled': props.disabled === true,
      'Button--minimal': props.look === 'minimal',
      'Button--error': props.state === 'error',
      'Button--mini': props.look === 'mini',
      'Button--white-label': props.whiteLabelEnabled === true,
    })
    const buttonStateClasses = classnames('Button__state', {
      'Button__state--inactive': props.state === undefined,
      'Button__state--active': props.state !== undefined,
      'Button__state--loading': props.state === 'loading',
      'Button__state--success': props.state === 'success',
      'Button__state--error': props.state === 'error',
    })
    const buttonLabelClasses = classnames('Button__label', {
      'Button__label--state-active': props.state !== undefined,
      'Button__label--mini': props.look === 'mini',
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
          <span className="Button__icon">{props.icon}</span>
        )}
        <span className={buttonLabelClasses}>{props.children}</span>
      </button>
    )
  }
}

Button.defaultProps = {
  keyColor: ZORROA_COLOR_GREEN_1,
  whiteLabelEnabled: false,
}

Button.propTypes = {
  children: PropTypes.node,
  state: PropTypes.oneOf(['loading', 'success', 'error']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  look: PropTypes.oneOf(['normal', 'minimal', 'mini']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.node,
  keyColor: PropTypes.string,
  whiteLabelEnabled: PropTypes.bool,
}
