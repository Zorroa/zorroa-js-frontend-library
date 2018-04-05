import React, { PropTypes } from 'react'
import classnames from 'classnames'

export default function FlashMessage(props) {
  const flashMessageBodyClasses = classnames('FlashMessage__body', {
    'FlashMessage__body--warning': props.look === 'warning',
    'FlashMessage__body--error': props.look === 'error',
    'FlashMessage__body--success': props.look === 'success',
  })

  return (
    <div className="FlashMessage">
      <div className={flashMessageBodyClasses}>{props.children}</div>
    </div>
  )
}

FlashMessage.propTypes = {
  children: PropTypes.node,
  look: PropTypes.oneOf(['warning', 'error', 'success']).isRequired,
}
