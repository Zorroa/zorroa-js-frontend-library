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

    if (
      isEnabled &&
      ['normal'].includes(this.props.look) &&
      !['error'].includes(this.props.state)
    ) {
      const keyColor = this.getKeyColor()
      return {
        backgroundColor: keyColor,
      }
    }
  }

  render() {
    const props = this.props
    const isNormalLook = props.look === 'normal' || props.look === undefined
    const isDangerLook = props.look === 'danger'
    const buttonClasses = classnames('Button', {
      'Button--disabled': props.disabled === true,
      'Button--minimal': props.look === 'minimal',
      'Button--error': props.state === 'error',
      'Button--mini': props.look === 'mini',
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
    const buttonUnderlayClasses = classnames('Button__underlay', {
      'Button__underlay--minimal': props.look === 'minimal',
      'Button__underlay--error': props.state === 'error',
      'Button__underlay--disabled': props.disabled === true,
      'Button__underlay--mini': props.look === 'mini',
    })
    return (
      <button
        className={buttonClasses}
        type={props.type}
        disabled={props.disabled}
        onClick={props.onClick}
        title={props.title}>
        {(isNormalLook || isDangerLook || props.look === 'mini') && (
          <span className={buttonStateClasses} title={props.state} />
        )}
        {props.icon !== undefined && (
          <span className="Button__icon">{props.icon}</span>
        )}
        <span className={buttonLabelClasses}>{props.children}</span>
        <span style={this.getStyle()} className={buttonUnderlayClasses} />
      </button>
    )
  }
}

Button.defaultProps = {
  keyColor: ZORROA_COLOR_GREEN_1,
  look: 'normal',
  type: 'button',
  disabled: false,
}

Button.propTypes = {
  children: PropTypes.node,
  state: PropTypes.oneOf(['loading', 'success', 'error']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  look: PropTypes.oneOf(['normal', 'minimal', 'mini', 'danger']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.node,
  keyColor: PropTypes.string,
}
