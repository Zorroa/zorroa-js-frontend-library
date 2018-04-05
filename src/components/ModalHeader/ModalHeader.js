import React, { PropTypes } from 'react'
import classnames from 'classnames'

const ModalHeader = props => {
  const { children, icon, closeFn } = props
  const modalClasses = classnames('ModalHeader', props.className)
  const iconClassNames = classnames('ModalHeader__icon', props.icon)
  return (
    <div className={modalClasses}>
      {icon !== undefined && <div className={iconClassNames} />}
      <div className="ModalHeader__title">{children}</div>
      <div className="ModalHeader__close" onClick={_ => closeFn && closeFn()}>
        <div className="icon-cross" />
      </div>
    </div>
  )
}

ModalHeader.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string,
  closeFn: PropTypes.func,
  className: PropTypes.string,
}

export default ModalHeader
