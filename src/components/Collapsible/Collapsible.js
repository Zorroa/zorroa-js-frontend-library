import React, { Component, PropTypes, cloneElement } from 'react'
import classnames from 'classnames'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static get propTypes () {
    return {
      children: PropTypes.node,
      header: PropTypes.element.isRequired,
      bodyStyle: PropTypes.object
    }
  }

  constructor (props) {
    super(props)
    this.state = { isOpen: false }
  }

  handleClick () {
    const { isOpen } = this.state
    const { children } = this.props
    if (children) {
      this.setState({ ...this.state, isOpen: !isOpen })
    }
  }

  render () {
    const { isOpen } = this.state
    const { children, header, bodyStyle } = this.props

    return (
      <div className={classnames('collapsible', 'flexCol', {'parent': children, 'open': open})}>
        <div className="collapsible-header flexCenter" onClick={this.handleClick.bind(this)}>
          { cloneElement(header, { isOpen, isParent: children && children.length > 0 }) }
        </div>
        <div style={bodyStyle} className="collapsible-body">
          { isOpen && (children) }
        </div>
      </div>
    )
  }
}
