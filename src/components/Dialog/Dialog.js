import PropTypes from 'prop-types'
import React from 'react'

import ModalHeader from '../ModalHeader'

const Dialog = props => {
  const { className, header, body, footer, closeFn } = props
  return (
    <div className={`Dialog ${className}`}>
      <div className="Dialog-header">
        <ModalHeader closeFn={closeFn}>{header}</ModalHeader>
      </div>
      <div className="Dialog-body">{body}</div>
      <div className="Dialog-footer">{footer}</div>
    </div>
  )
}

Dialog.propTypes = {
  className: PropTypes.string,
  closeFn: PropTypes.func,
  header: PropTypes.element,
  body: PropTypes.element,
  footer: PropTypes.element,
}

export default Dialog
