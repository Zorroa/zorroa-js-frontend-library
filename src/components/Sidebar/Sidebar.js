import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Sidebar extends Component {
  static displayName () {
    return 'Sidebar'
  }

  static get propTypes () {
    return {
      isRightEdge: PropTypes.bool,
      children: PropTypes.node
    }
  }

  static get defaultProps () {
    return {
      isRightEdge: false
    }
  }

  constructor (props) {
    super(props)
    this.state = { open: true }
  }

  handleClick () {
    this.setState({ open: !this.state.open })
  }

  render () {
    // Select the right or left facing triangle unicode char using XOR
    const arrow = this.state.open !== this.props.isRightEdge ? '\u25C0' : '\u25B6'
    const buttonClassNames = classnames('sidebar-button', {
      'sidebar-button-left': !this.props.isRightEdge
    })
    const classNames = classnames('sidebar', {
      'sidebar-open': this.state.open
    })

    return (
      <div className={classNames}>
        <div className={buttonClassNames}>
          <label className="sidebar-button" onClick={this.handleClick.bind(this)}>{arrow}{arrow}</label>
        </div>
        {this.props.children}
      </div>
    )
  }
}
