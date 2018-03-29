import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import './Radio.scss'

export default class FormInput extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    error: PropTypes.bool,
    onChange: PropTypes.func,
    checked: PropTypes.bool,
    name: PropTypes.string.isRequired
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
        value: nextProps.checked === true
      })
    }
  }

  onChange = event => {
    const checked = event.target.checked

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(checked)
    }
    this.setState({
      value: checked
    })
  }

  render () {
    const {className, error} = this.props
    const inputClasses = classnames('FormInput__radio-virtual', {
      'FormInput__radio--error': error === true
    }, className)

    return (
      <div className="FormInput__radio">
        <input
          className={'FormInput__radio-native'}
          name={this.props.name}
          type="radio"
          onChange={this.onChange}
          checked={this.props.checked}
        />
        <span className={inputClasses} />
      </div>
    )
  }
}
