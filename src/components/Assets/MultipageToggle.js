import React, { PropTypes } from 'react'
import classnames from 'classnames'

const MultipageToggle = (props) => (
  <div onClick={props.onClick}
       className={classnames('MultipageToggle', 'icon-stack-empty',
         { 'MultipageToggle-enabled': props.enabled })} />
)

MultipageToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired
}

export default MultipageToggle
