import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static get propTypes () {
    return {
      children: PropTypes.node,
      headerFn: PropTypes.func.isRequired,
      style: PropTypes.object,
    }
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
    const { children, headerFn, style } = this.props

    return (
      <div style={style} className={classnames('collapsible', 'flexCol', {'parent': children, 'open': open })}>
        <div style={style} className="collapsible-header flexCenter" onClick={this.handleClick.bind(this)}>
          {headerFn(children, open)}
        </div>
        {open && (children)}
      </div>
    )
  }
}
