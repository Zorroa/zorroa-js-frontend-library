import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import './Select.scss'

export default class Select extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.object),
    fieldLabel: PropTypes.string,
    fieldKey: PropTypes.string,
    vertical: PropTypes.bool,
    error: PropTypes.bool,
    required: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
    deafultLabel: PropTypes.string
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

  onChange = (event) => {
    const value = event.target.value
    const fieldKey = this.props.fieldKey

    this.setState({
      value
    })

    if (this.props.deafultLabel !== undefined && value === '') {
      return
    }

    this.props.onChange(
      this.props.options.find(
        option => option[fieldKey].toString() === value
      )
    )
  }

  render () {
    const {required, className, error, deafultLabel} = this.props
    const inputClasses = classnames('FormInput__select', {
      'FormInput__select--error': error === true
    }, className)

    return (
      <div className={inputClasses}>
        <select
          className='FormInput__select-native'
          required={required}
          onChange={this.onChange}
          value={this.state.value}
        >
          deafultLabel !== undefined && (
            <option key={-1} value=''>
              {deafultLabel}
            </option>
          )

          {this.props.options.map(option => {
            const label = option[this.props.fieldLabel]
            const key = option[this.props.fieldKey]

            return (
              <option key={key} value={key}>
                {label}
              </option>
            )
          })}
        </select>
      </div>
    )
  }
}
