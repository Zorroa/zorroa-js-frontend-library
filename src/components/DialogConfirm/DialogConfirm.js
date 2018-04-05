import React, { PropTypes } from 'react'

import Dialog from '../Dialog'

const DialogConfirm = props => {
  const { title, message, confirmAction, cancelAction } = props
  const header = <span className="DialogConfirm-header">{title}</span>
  const body = <div className="DialogConfirm-body">{message}</div>

  const footer = (
    <div className="DialogConfirm-footer">
      <div
        className="DialogConfirm-cancel"
        onClick={_ => cancelAction && cancelAction()}>
        Cancel
      </div>
      <div
        className="DialogConfirm-confirm"
        onClick={_ => confirmAction && confirmAction()}>
        Okay
      </div>
    </div>
  )

  return (
    <Dialog
      className="DialogConfirm"
      closeFn={_ => cancelAction && cancelAction()}
      header={header}
      body={body}
      footer={footer}
    />
  )
}

DialogConfirm.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  confirmAction: PropTypes.func,
  cancelAction: PropTypes.func,
}

export default DialogConfirm
