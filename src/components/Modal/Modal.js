import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Modal extends Component {
  static propTypes = {
    body: PropTypes.node,
    width: PropTypes.node,
    onModalUnderlayClick: PropTypes.func,
  }

  static defaultProps = { width: '75%' }

  isModalUnderlayClickable() {
    return typeof this.props.onModalUnderlayClick === 'function'
  }

  onModalUnderlayClick = event => {
    const hasClickedUnderlay = event.target === event.currentTarget
    const shouldHandleUnderlayClick =
      this.isModalUnderlayClickable() && hasClickedUnderlay

    if (shouldHandleUnderlayClick) {
      this.props.onModalUnderlayClick()
    }
  }

  render() {
    const { body, width } = this.props
    if (!body) return null
    const classes = classnames('modal-container', {
      'modal-container--clickable': this.props.onModalUnderlayClick,
    })
    return (
      <div className={classes} onClick={this.onModalUnderlayClick}>
        <div className="modal" key="modal" style={{ width }}>
          <div className="modal-body">{body}</div>
        </div>
      </div>
    )
  }
}
