import React, { Component, PropTypes } from 'react'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static propTypes = {
    children : PropTypes.node,
    header   : PropTypes.node,
    style    : PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { open: false }
  }

  handleClick () {
    const { open } = this.state
    const { children } = this.props
    if (children) {
      this.setState({ ...this.state, open: !open })
    }
  }

  render () {
    const { open } = this.state
    const { children, header, style } = this.props
    const caretClass = 'collapsible-caret-' + (open ? 'open' : 'closed')

    return (
      <div style={style} className="collapsible">
        <div style={style} className="collapsible-header" onClick={this.handleClick.bind(this)}>
          { children && (<div className={caretClass} />) }
             {header}
        </div>
        {open && (children)}
      </div>
    )
  }
}
