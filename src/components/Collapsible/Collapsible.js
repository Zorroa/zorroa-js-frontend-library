import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static get propTypes () {
    return {
      children: PropTypes.node,
      header: PropTypes.node,
      style: PropTypes.object
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
    const { children, header, style } = this.props
    const classNames = classnames('collapsible', { 'parent': !!children, 'open': open })

    return (
      <div style={style} className={classNames}>
        <div style={style} className="collapsible-header flexCenter" onClick={this.handleClick.bind(this)}>
          {header}
          {parent && <div className='flexOn'/>}
          {parent && <div className='collapsible-caret icon-arrow-down'/>}
        </div>
        {open && (children)}
      </div>
    )
  }
}
