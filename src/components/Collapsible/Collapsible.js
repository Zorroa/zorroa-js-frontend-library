import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import CollapsibleHeader from './CollapsibleHeader'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static propTypes = {
    // input props
    header: PropTypes.element.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,

    closeIcon: PropTypes.string,
    isSelected: PropTypes.bool,
    onOpen: PropTypes.func,
    onSelect: PropTypes.func,
    openIcon: PropTypes.string,
    className: PropTypes.string,

    // child props
    children: PropTypes.node
  }

  render () {
    const { header, isIconified, isSelected, isOpen, onOpen, onSelect } = this.props
    const { children, openIcon, closeIcon } = this.props

    const CollapsibleHeaderParams = {
      closeIcon,
      header,
      isIconified,
      isOpen,
      isSelected,
      onSelect,
      openIcon,
      isParent: !!children,
      onOpen
    }

    const { className } = this.props
    const collapsibleClasses = classnames('Collapsible', 'flexCol',
      { isParent: children, isOpen, isIconified, [className]: !!className })

    return (
      <div className={collapsibleClasses}>
        <CollapsibleHeader {...CollapsibleHeaderParams}/>
        { !isIconified && isOpen && (
          <div className="Collapsible-body">
            { children }
          </div>
        )}
      </div>
    )
  }
}
