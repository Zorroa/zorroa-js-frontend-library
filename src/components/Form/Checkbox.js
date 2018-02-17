import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import './Input.scss'

export default class FormInput extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    error: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string
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
    const {className, error} = this.props
    const inputClasses = classnames('FormInput__radio', {
      'FormInput__radio--error': error === true
    }, className)

    return (
      <input
        className={inputClasses}
        type="checkbox"
        onChange={this.onChange}
        value={this.state.value}
      />
    )
  }
}
