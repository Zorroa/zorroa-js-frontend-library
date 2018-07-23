import React, { PropTypes, PureComponent } from 'react'
import classnames from 'classnames'

class DropdownFontIcon extends PureComponent {
  static propTypes = {
    dark: PropTypes.bool.isRequired,
    children: PropTypes.any,
    icon: PropTypes.string.isRequired,
  }

  render() {
    const dropdownItemClasses = classnames(
      'DropdownMenu__font-icon',
      this.props.icon,
      {
        'DropdownMenu__font-icon--dark': this.props.dark === true,
      },
    )
    return <div className={dropdownItemClasses}>{this.props.children}</div>
  }
}

export default DropdownFontIcon
