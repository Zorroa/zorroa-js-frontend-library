import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'

export default class ModalOverlayBody extends Component {
  static propTypes = {
    size: PropTypes.oneOf(['narrow']),
    children: PropTypes.node,
  }

  render() {
    const className = classnames('ModalOverlayBody', {
      'ModalOverlayBody--narrow': this.props.size === 'narrow',
    })

    return (
      <div className={className}>
        <div className="ModalOverlayBody__scroll">{this.props.children}</div>
      </div>
    )
  }
}
