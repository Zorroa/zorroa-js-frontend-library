import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ModalOverlayHeader extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    children: React.PropTypes.any,
  }

  onClose = event => {
    this.props.onClose(event)
  }

  render() {
    return (
      <div className="ModalOverlayHeader">
        {this.props.children}
        <div className="ModalOverlayHeader__close" onClick={this.onClose}>
          <div className="icon-cross" />
        </div>
      </div>
    )
  }
}
