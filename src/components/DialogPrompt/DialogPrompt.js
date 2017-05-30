import React, { Component, PropTypes } from 'react'

import Dialog from '../Dialog'

export default class DialogPrompt extends Component {
  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    confirmAction: PropTypes.func,
    cancelAction: PropTypes.func
  }

  input = null

  cancel = () => {
    if (this.props.cancelAction) this.props.cancelAction()
  }

  confirm = () => {
    if (this.props.confirmAction && this.input) {
      this.props.confirmAction(this.input.value)
    }
  }

  keyDown = (event) => {
    switch (event.key) {
      case 'Enter': return this.confirm()
      case 'Escape': return this.cancel()
      default:
    }
  }

  render () {
    const { title, message, cancelAction } = this.props
    const header = <span className='DialogPrompt-header'>{title}</span>
    const body = (
      <div className='DialogPrompt-body'>
        {message}
        <input className='DialogPrompt-input'
               onKeyDown={this.keyDown}
               ref={(input) => { this.input = input; if (input) input.focus() }} />
      </div>
    )

    const footer = (
      <div className='DialogPrompt-footer'>
        <div className='DialogPrompt-cancel' onClick={this.cancel}>Cancel</div>
        <div className='DialogPrompt-confirm' onClick={this.confirm}>Okay</div>
      </div>
    )

    return (
      <Dialog className='DialogPrompt'
              closeFn={cancelAction}
              header={header}
              body={body}
              footer={footer}/>
    )
  }
}
