import PropTypes from 'prop-types'
import React, { Component } from 'react'
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
    readOnly: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inlineReset: PropTypes.bool,
    autocomplete: PropTypes.string,
    type: PropTypes.oneOf([
      'text',
      'password',
      'number',
      'color',
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
      'week',
    ]),
  }

  constructor(props) {
    super(props)

    this.state = {
      value: props.value || '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value || '',
      })
    }
  }

  onChange = event => {
    const value = event.target.value
    if (this.props.type === 'file') {
      event.persist()
    }

    this.setState(
      {
        value: typeof this.props.value === 'number' ? Number(value) : value,
      },
      () => {
        if (this.props.type === 'file') {
          this.props.onChange(event.target.files)
          return
        }
        this.props.onChange(this.state.value)
      },
    )
  }

  resetInput = () => {
    this.setState({
      value: '',
    })
  }

  getType(type) {
    if (type === 'color') {
      return 'text'
    }

    return type
  }

  render() {
    const {
      type,
      required,
      className,
      error,
      readOnly,
      autocomplete,
    } = this.props
    const inputClasses = classnames(
      'FormInput__input',
      {
        'FormInput__input--error': error === true,
        'FormInput__input--color': type === 'color',
      },
      className,
    )

    const inputNativeClasses = classnames('FormInput__input-native', {
      'FormInput__input-native--color': type === 'color',
    })

    const colorPreviewClasses = classnames('FormInput__color-preview', {
      'FormInput__color-preview--error': error,
    })

    return (
      <div className={inputClasses}>
        <input
          className={inputNativeClasses}
          type={this.getType(type)}
          required={required}
          autoComplete={autocomplete}
          readOnly={readOnly}
          onChange={this.onChange}
          value={this.state.value}
        />
        {type === 'color' && (
          <span
            className={colorPreviewClasses}
            style={{
              backgroundColor: error ? 'transparent' : this.state.value,
            }}
          />
        )}
        {this.props.inlineReset && (
          <span
            className="icon-cancel-circle FormInput__input-inline-reset"
            onClick={this.resetInput}
          />
        )}
      </div>
    )
  }
}
