import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import Button from '../../Form/Button'

class ssoLogout extends Component {
  static propTypes = {
    samlUrl: PropTypes.string,
  }

  render() {
    const { samlUrl } = this.props

    return (
      <div className="auth flexCenter">
        <div className="auth-box flexColCenter">
          <div className="auth-logo flexCenter" />
          <div className="auth-message signout-message">
            User logged out, please log back in.
          </div>
          <Button
            onClick={e => {
              e.preventDefault()
              window.location = samlUrl
            }}>
            Login
          </Button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  samlUrl: state.auth.samlUrl,
}))(ssoLogout)
