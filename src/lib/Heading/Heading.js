import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'
import './Heading.scss'

export default function Heading(props) {
  const buttonClasses = classnames('Heading', {
    'Heading--huge': props.size === 'huge',
    'Heading--large': props.size === 'large' || props.size === undefined,
    'Heading--medium': props.size === 'medium',
    'Heading--small': props.size === 'small',
    'Heading--tiny': props.size === 'tiny',
    'Heading--micro': props.size === 'micro',
  })
  const NativeHeadingElement = props.level || 'h1'

  return (
    <NativeHeadingElement className={buttonClasses}>
      {props.children}
    </NativeHeadingElement>
  )
}

Heading.propTypes = {
  children: PropTypes.node,
  level: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  size: PropTypes.oneOf(['huge', 'large', 'medium', 'small', 'tiny', 'micro']),
}
