import React, { Component, PropTypes } from 'react'

export default class ModalOverlayHeader extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]),
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
