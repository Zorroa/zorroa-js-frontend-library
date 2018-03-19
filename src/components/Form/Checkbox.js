import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import './Checkbox.scss'

export default class FormInput extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    error: PropTypes.bool,
    onChange: PropTypes.func,
    checked: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      checked: props.checked === true
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.checked !== this.state.checked) {
      this.setState({
        checked: nextProps.checked === true
      })
    }
  }

  onChange = event => {
    const checked = event.target.checked

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(checked)
    }
    this.setState({
      checked
    })
  }

  render () {
    const {className, error} = this.props
    const inputClasses = classnames('FormInput__checkbox', {
      'FormInput__checkbox--error': error === true
    }, className)

    return (
      <input
        className={inputClasses}
        type="checkbox"
        onChange={this.onChange}
        checked={this.state.checked}
      />
    )
  }
}
