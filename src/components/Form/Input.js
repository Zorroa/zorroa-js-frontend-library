import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import './Input.scss'

export default class FormInput extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    label: PropTypes.string,
    vertical: PropTypes.bool,
    error: PropTypes.bool,
    required: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
    type: PropTypes.oneOf([
      'text',
      'password',
      'number',
      'color',
      'checkbox',
      'radio',
      'date',
      'file',
      'month',
      'range',
      'time',
      'email',
      'search',
      'submit',
      'tel',
      'text',
      'url',
      'week'
    ])
  }

  constructor (props) {
    super(props)

    this.state = {
      value: props.value || ''
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value || ''
      })
    }
  }

  onChange = event => {
    const value = event.target.value
    this.props.onChange(value)
    this.setState({
      value
    })
  }

  render () {
    const {type, required, className, error} = this.props
    const inputClasses = classnames('FormInput__input', {
      'FormInput__input--error': error === true
    }, className)

    return (
      <input
        className={inputClasses}
        type={type}
        required={required}
        onChange={this.onChange}
        value={this.state.value}
      />
    )
  }
}
