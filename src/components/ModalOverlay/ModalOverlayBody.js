import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'

export default class ModalOverlayBody extends Component {
  static propTypes = {
    size: PropTypes.oneOf(['narrow', 'small']),
    children: PropTypes.node,
  }

  render() {
    const bodyClasses = classnames('ModalOverlayBody', {
      'ModalOverlayBody--small': this.props.size === 'small',
      'ModalOverlayBody--narrow': this.props.size === 'narrow',
    })
    const scrollClasses = classnames('ModalOverlayBody__scroll', {
      'ModalOverlayBody__scroll--small': this.props.size === 'small',
    })

    return (
      <div className={bodyClasses}>
        <div className={scrollClasses}>{this.props.children}</div>
      </div>
    )
  }
}
