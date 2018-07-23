import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classnames from 'classnames'

class DropdownMenu extends PureComponent {
  static propTypes = {
    dark: PropTypes.bool.isRequired,
    children: React.PropTypes.any,
  }

  isDark() {
    return this.props.dark === true
  }

  render() {
    const dropdownItemCLasses = classnames('DropdownMenu', {
      'DropdownMenu--dark': this.isDark(),
    })
    return <div className={dropdownItemCLasses}>{this.props.children}</div>
  }
}

export default DropdownMenu
