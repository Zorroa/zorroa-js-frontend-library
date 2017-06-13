import React from 'react'

const Logo = () => {
  const img = require('./zorroa-logo-badge.svg')
  return (
    <img className="Logo" src={img} title={`Zorroa Curator ${zvVersion}`} />
  )
}

export default Logo
