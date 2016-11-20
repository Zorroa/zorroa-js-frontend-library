import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Sidebar extends Component {
  static displayName () {
    return 'Sidebar'
  }

  static propTypes = {
    // input props
    isRightEdge: PropTypes.bool,
    isIconified: PropTypes.bool,
    onToggle: PropTypes.func,

    // children props
    children: PropTypes.node
  }

  static get defaultProps () {
    return {
      isRightEdge: false
    }
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    return this.props.isIconified === this.props.isRightEdge ? '\u25C0' : '\u25B6'
  }

  render () {
    const arrow = this.buttonChar()
    const { isIconified, children, onToggle } = this.props
    return (
      <div className={classnames('Sidebar flexOff flexCol fullHeight', { 'isOpen': !isIconified })}>
        <div className={classnames('Sidebar-button flexOff', { 'left': !this.props.isRightEdge })}
             onClick={onToggle}
        >
          <label>{arrow}{arrow}</label>
        </div>
        <div className={'Sidebar-scroll flexOn fullHeight'} >
          { children }
        </div>
      </div>
    )
  }
}
