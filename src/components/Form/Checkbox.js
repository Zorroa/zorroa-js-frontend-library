import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import './Checkbox.scss'
import { KEY_COLOR } from '../../constants/themeDefaults'

export default class FormInput extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    error: PropTypes.bool,
    onChange: PropTypes.func,
    checked: PropTypes.bool,
    keyColor: PropTypes.string.isRequired,
    whiteLabelEnabled: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      checked: props.checked === true,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== this.state.checked) {
      this.setState({
        checked: nextProps.checked === true,
      })
    }
  }

  onChange = event => {
    const checked = event.target.checked
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(checked)
    }
    this.setState({
      checked,
    })
  }

  getKeyColor() {
    if (this.props.whiteLabelEnabled === true) {
      return this.props.keyColor
    }

    return KEY_COLOR
  }

  render() {
    const { className, error } = this.props
    const inputClasses = classnames(
      'FormInput__checkbox-virtual',
      {
        'FormInput__checkbox-virtual': error === true,
      },
      className,
    )

    return (
      <div className="FormInput__checkbox">
        <input
          className="FormInput__checkbox-native"
          type="checkbox"
          onChange={this.onChange}
          checked={this.state.checked}
        />
        <span
          className={inputClasses}
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Cdefs%3E%3Crect%20id%3D%22a%22%20width%3D%2220%22%20height%3D%2220%22%20rx%3D%223%22%2F%3E%3C%2Fdefs%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cmask%20id%3D%22b%22%20fill%3D%22%23fff%22%3E%3Cuse%20xlink%3Ahref%3D%22%23a%22%2F%3E%3C%2Fmask%3E%3Cuse%20fill%3D%22%23F14387%22%20xlink%3Ahref%3D%22%23a%22%2F%3E%3Cg%20fill%3D%22${encodeURI(
              this.getKeyColor(),
            )}%22%20mask%3D%22url(%23b)%22%3E%3Cpath%20d%3D%22M-23-39h75v75h-75z%22%2F%3E%3C%2Fg%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M16.8%205.2a.8.8%200%200%200-1%200l-8%208-2.5-2.5a.8.8%200%200%200-1%200c-.2.1-.3.3-.3.5s0%20.4.2.5l3%203a.7.7%200%200%200%201%200l8.6-8.4.2-.6c0-.2%200-.4-.2-.5%22%20mask%3D%22url(%23b)%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
          }}
        />
      </div>
    )
  }
}
