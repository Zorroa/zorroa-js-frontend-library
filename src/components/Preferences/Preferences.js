import React, { PropTypes } from 'react'

import User from '../../models/User'

const Preferences = (props) => (
  <div>
    {props.user.firstName} {props.user.lastName}&rsquo;s personal preferences.
  </div>
)

Preferences.propTypes = {
  user: PropTypes.instanceOf(User)
}

export default Preferences
