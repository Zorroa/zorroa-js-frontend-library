import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

class DropdownGroup extends PureComponent {
  static propTypes = {
    dark: PropTypes.bool.isRequired,
    children: React.PropTypes.any,
  }

  render() {
    const dropdownItemCLasses = classnames('DropdownMenu__group', {
      'DropdownMenu__group--dark': this.props.dark === true,
    })
    return <div className={dropdownItemCLasses}>{this.props.children}</div>
  }
}

export default DropdownGroup
