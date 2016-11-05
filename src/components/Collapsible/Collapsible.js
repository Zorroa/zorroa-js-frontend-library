import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import CollapsibleHeader from './CollapsibleHeader'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static propTypes = {
    children: PropTypes.node,
    closeIcon: PropTypes.string,
    dropparams: PropTypes.object,
    header: PropTypes.element.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool,
    isSelected: PropTypes.bool,
    onOpen: PropTypes.func,
    onSelect: PropTypes.func,
    openIcon: PropTypes.string,
    className: PropTypes.string
  }

  handleClick = this.handleClick.bind(this)

  constructor (props) {
    super(props)
    this.state = { isOpen: false }
  }

  handleClick (event) {
    const { isOpen } = this.state
    const { children, onOpen } = this.props
    if (children) {
      this.setState({ ...this.state, isOpen: !isOpen })
    }
    onOpen && onOpen(!isOpen)
    return false
  }

  render () {
    const { isOpen } = this.state
    const { children, closeIcon, dropparams, header, isIconified, isSelected, onSelect, openIcon } = this.props

    const CollapsibleHeaderParams = {
      closeIcon,
      header,
      isIconified,
      isOpen,
      isSelected,
      onSelect,
      openIcon,
      isParent: children && !!children.length,
      onOpen: this.handleClick.bind(this)
    }

    const { className } = this.props
    const collapsibleClasses = classnames('Collapsible', 'flexCol', {'parent': children, open, [className]: !!className})

    return (
      <div className={collapsibleClasses} {...dropparams}>
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
