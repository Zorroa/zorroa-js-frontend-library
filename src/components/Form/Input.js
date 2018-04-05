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
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inlineReset: PropTypes.bool,
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
    this.setState(
      {
        value: typeof this.props.value === 'number' ? Number(value) : value,
      },
      () => {
        this.props.onChange(this.state.value)
      },
    )
  }

  resetInput = () => {
    this.setState({
      value: '',
    })
  }

  render() {
    const { type, required, className, error } = this.props
    const inputClasses = classnames(
      'FormInput__input',
      {
        'FormInput__input--error': error === true,
      },
      className,
    )

    return (
      <div className={inputClasses}>
        <input
          className="FormInput__input-native"
          type={type}
          required={required}
          onChange={this.onChange}
          value={this.state.value}
        />
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
