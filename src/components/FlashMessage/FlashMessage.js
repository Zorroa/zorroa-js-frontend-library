import React, { PropTypes } from 'react'
import classnames from 'classnames'

export default function FlashMessage (props) {
  const flashMessageClasses = classnames('FlashMessage', {
    'FlashMessage--warning': props.look === 'warning'
  })

  return (
    <div
      className={flashMessageClasses}
    >
      {props.children}
    </div>
  )
}

FlashMessage.propTypes = {
  children: PropTypes.node,
  look: PropTypes.oneOf([
    'warning'
  ])
}
