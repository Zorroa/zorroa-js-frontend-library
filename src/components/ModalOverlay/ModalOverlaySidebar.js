import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'

export default class ModalOverlaySidebar extends Component {
  static propTypes = {
    size: PropTypes.oneOf(['narrow']),
    children: PropTypes.node,
  }

  render() {
    const className = classnames('ModalOverlaySidebar', {
      'ModalOverlaySidebar--narrow': this.props.size === 'narrow',
    })
    return (
      <div className={className}>
        <div className="ModalOverlaySidebar__scroll">{this.props.children}</div>
      </div>
    )
  }
}
