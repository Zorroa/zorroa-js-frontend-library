import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import './Input.scss'

export default class Input extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value || '',
    }
    this.onChange = this._onChangeUnbound.bind(this)
    this.resetInput = this._resetInputUnbound.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState(state => {
        return {
          value: nextProps.value || state.value,
        }
      })
    }
  }

  _onChangeUnbound(event) {
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

  _resetInputUnbound() {
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
      placeholder,
      disabled,
      search,
    } = this.props
    const inputClasses = classnames(
      'Input',
      {
        'Input--error': error === true,
        'Input--color': type === 'color',
        'Input--disabled': disabled,
      },
      className,
    )

    const inputNativeClasses = classnames('Input__native', {
      'Input__native--color': type === 'color',
      'Input__native--disabled': disabled,
      'Input__native--search': search === true,
    })

    const colorPreviewClasses = classnames('Input__color-preview', {
      'Input__color-preview--error': error,
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
          placeholder={placeholder}
          disabled={disabled ? 'disabled' : false}
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
            className="icon-cancel-circle Input__inline-reset"
            onClick={this.resetInput}
          />
        )}
      </div>
    )
  }
}

Input.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  label: PropTypes.string,
  vertical: PropTypes.bool,
  error: PropTypes.bool,
  required: PropTypes.bool,
  search: PropTypes.bool,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inlineReset: PropTypes.bool,
  autocomplete: PropTypes.string,
  disabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
    'tel',
    'text',
    'url',
    'week',
  ]),
}
