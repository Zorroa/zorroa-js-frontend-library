import React, { PropTypes } from 'react'

const Logo = props => {
  const img = require(props.dark
    ? './zorroa-logo-light.svg'
    : './zorroa-logo.svg')
  return (
    <img className="Logo" src={img} title={`Zorroa Curator ${zvVersion}`} />
  )
}

Logo.propTypes = {
  dark: PropTypes.bool,
}

export default Logo
