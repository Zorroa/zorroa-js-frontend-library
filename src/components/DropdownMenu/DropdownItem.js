import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

class DropdownItem extends PureComponent {
  static propTypes = {
    dark: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
    children: React.PropTypes.any,
  }

  hasHandler() {
    return typeof this.props.onClick === 'function'
  }

  handleClick = event => {
    if (this.hasHandler()) {
      this.props.onClick(event)
    }
  }

  isDark() {
    return this.props.dark === true
  }

  render() {
    const dropdownItemCLasses = classnames('DropdownMenu__item', {
      'DropdownMenu__item--dark': this.isDark(),
      'DropdownMenu__item--disabled': !this.hasHandler(),
    })
    return (
      <div className={dropdownItemCLasses} onClick={this.handleClick}>
        {this.props.children}
      </div>
    )
  }
}

export default DropdownItem
