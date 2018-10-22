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
    } = this.props
    const inputClasses = classnames(
      'Input',
      {
        'Input--error': error === true,
        'Input--color': type === 'color',
      },
      className,
    )

    const inputNativeClasses = classnames('Input__native', {
      'Input__native--color': type === 'color',
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
    'tel',
    'text',
    'url',
    'week',
  ]),
}
