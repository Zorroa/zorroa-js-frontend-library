import PropTypes from 'prop-types'
import React from 'react'

import Dialog from '../Dialog'

const DialogAlert = props => {
  const { title, message, confirmAction } = props
  return (
    <Dialog
      className="DialogAlert"
      closeFn={confirmAction}
      header={<span className="DialogAlert-header">{title}</span>}
      body={<div className="DialogAlert-body">{message}</div>}
      footer={
        <div className="DialogAlert-footer">
          <div
            className="DialogAlert-dismiss"
            onClick={_ => confirmAction && confirmAction()}>
            OK
          </div>
        </div>
      }
    />
  )
}

DialogAlert.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmAction: PropTypes.func,
}

export default DialogAlert
