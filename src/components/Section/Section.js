import PropTypes from 'prop-types'
import React from 'react'

export default function Section({ children, id }) {
  return (
    <section id={id} className="Section">
      {children}
    </section>
  )
}

Section.propTypes = {
  children: PropTypes.any,
  id: PropTypes.string,
}
