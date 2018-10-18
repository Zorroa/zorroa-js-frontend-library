import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import { ZORROA_COLOR_GREEN_1 } from '../variables.js'
import './Radio.scss'

export default class Radio extends Component {
  constructor(props) {
    super(props)

    this.state = {
      checked: props.checked === true,
    }
    this.onChange = this.onChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== this.state.checked) {
      this.setState({
        value: nextProps.checked === true,
      })
    }
  }

  getKeyColor() {
    return this.props.keyColor
  }

  onChange() {
    const checked = event.target.checked

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(checked)
    }
    this.setState({
      value: checked,
    })
  }

  render() {
    const { className, error } = this.props
    const inputClasses = classnames(
      'Radio__virtual',
      {
        'Radio--error': error === true,
      },
      className,
    )

    return (
      <div className="Radio">
        <input
          className={'Radio__native'}
          name={this.props.name}
          type="radio"
          onChange={this.onChange}
          checked={this.props.checked}
        />
        <span
          style={{ backgroundColor: this.getKeyColor() }}
          className={inputClasses}
        />
      </div>
    )
  }
}

Radio.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  error: PropTypes.bool,
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  name: PropTypes.string.isRequired,
  keyColor: PropTypes.string,
}

Radio.defaultProps = {
  keyColor: ZORROA_COLOR_GREEN_1,
}
