import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

export default class ToggleButton extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.any,
    dark: PropTypes.bool.isRequired,
  }

  state = {
    isOpen: false,
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
  }

  handleOnClickCallback() {
    if (typeof this.props.onClick === 'function') {
      this.props.onClick(this.state.isOpen)
    }

    if (this.state.isOpen) {
      document.addEventListener('click', this.handleDocumentClick)
    } else {
      document.removeEventListener('click', this.handleDocumentClick)
    }
  }

  handleDocumentClick = event => {
    if (this.state.isOpen === true) {
      const isOpen = false
      this.setState(
        {
          isOpen,
        },
        this.handleOnClickCallback,
      )
    }
  }

  isDark() {
    return this.props.dark === true
  }

  isOpen() {
    return this.state.isOpen === true
  }

  onClick = event => {
    event.preventDefault()
    event.stopPropagation()
    if (this.state.isOpen === false) {
      this.setState(
        {
          isOpen: true,
        },
        this.handleOnClickCallback,
      )
    }
  }

  render() {
    const buttonClasses = classnames('ToggleButton', {
      'ToggleButton--dark': this.props.dark,
      'ToggleButton--open': this.isOpen(),
    })
    const iconClasses = classnames('ToggleButton__caret icon-arrow-down', {
      'ToggleButton__caret--is-open': this.isOpen(),
    })
    return (
      <button className={buttonClasses} onClick={this.onClick}>
        <span className="ToggleButton__label">{this.props.children}</span>
        <i className={iconClasses} />
      </button>
    )
  }
}
