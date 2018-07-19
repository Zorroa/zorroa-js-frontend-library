import PropTypes from 'prop-types'
import React from 'react'

const Check = ({ state, onClick, color }) => {
  const className = 'Check icon-checkbox-' + state
  if (state === 'empty') color = '#808080'
  return (
    <div
      onClick={e => {
        onClick(e)
      }}
      className={className}
      style={{ color }}
    />
  )
}

Check.defaultProps = {
  color: '#808080',
}

Check.propTypes = {
  state: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  color: PropTypes.string,
}

export default Check
