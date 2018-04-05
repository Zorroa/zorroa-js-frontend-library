import React, { PropTypes } from 'react'
import classnames from 'classnames'

const MultipageToggle = props => (
  <div
    onClick={props.onClick}
    title="Stack multipage assets"
    className={classnames('MultipageToggle Footer__icon', 'icon-stack-empty', {
      'Footer__icon--enabled': props.enabled,
    })}
  />
)

MultipageToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
}

export default MultipageToggle
