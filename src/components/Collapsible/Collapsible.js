import React, { Component, PropTypes, cloneElement } from 'react'
import classnames from 'classnames'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static propTypes = {
    children: PropTypes.node,
    header: PropTypes.element.isRequired,
    dropparams: PropTypes.object,
    onSelect: PropTypes.func
  }

  handleClick = this.handleClick.bind(this)

  constructor (props) {
    super(props)
    this.state = { isOpen: false }
  }

  handleClick (event) {
    const { isOpen } = this.state
    const { children } = this.props
    event.stopPropagation()
    if (children) {
      this.setState({ ...this.state, isOpen: !isOpen })
    }
  }

  render () {
    const { isOpen } = this.state
    const { children, header, dropparams, onSelect } = this.props

    return (
      <div className={classnames('collapsible', 'flexCol', {'parent': children, 'open': open})} {...dropparams}>
        <div className="collapsible-header flexCenter" onClick={onSelect ? undefined : this.handleClick}>
          { cloneElement(header, { isOpen, onSelect: onSelect, onOpen: this.handleClick, isParent: children && children.length > 0 }) }
        </div>
        <div style={{marginLeft: '16px'}} className="collapsible-body">
          { isOpen && (children) }
        </div>
      </div>
    )
  }
}
