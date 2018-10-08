import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'

export default function Paragraph(props) {
  const paragraphClasses = classnames('Paragraph', {
    'Paragraph--large': props.size === 'large',
    'Paragraph--normal': props.size === 'normal' || props.size === undefined,
    'Paragraph--small': props.size === 'small',
  })

  return <p className={paragraphClasses}>{props.children}</p>
}

Paragraph.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['large', 'normal', 'small']),
}
