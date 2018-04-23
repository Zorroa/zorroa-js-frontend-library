import React, { Component, PropTypes } from 'react'

export default class ModalOverlayFooter extends Component {
  render() {
    return <div className="ModalOverlayFooter">{this.props.children}</div>
  }
}
