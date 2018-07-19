import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ModalOverlayFooter extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }
  render() {
    return <div className="ModalOverlayFooter">{this.props.children}</div>
  }
}
