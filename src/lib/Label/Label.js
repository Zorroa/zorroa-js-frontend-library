import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'
import './Label.scss'

export default function Label(props) {
  const labelClasses = classnames('Label', props.className, {
    'Label--vertical': props.vertical,
    'Label--error': props.error === true,
    'Label--is-dark': props.isDark === true,
  })

  return (
    <label className={labelClasses}>
      {props.label && <span className="Label__label">{props.label}</span>}
      {props.children}
      {props.afterLabel && (
        <span className="Label__label">{props.afterLabel}</span>
      )}
    </label>
  )
}

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  label: PropTypes.string,
  afterLabel: PropTypes.string,
  vertical: PropTypes.bool,
  error: PropTypes.bool,
  isDark: PropTypes.bool,
}
