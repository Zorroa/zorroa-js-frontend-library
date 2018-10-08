import PropTypes from 'prop-types'
import React from 'react'

export default function Section({ children }) {
  return <section className="Section">{children}</section>
}

Section.propTypes = {
  children: PropTypes.any,
}
