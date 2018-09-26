import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Button from '../../Form/Button'

class TimedLogout extends Component {
  static propTypes = {
    size: PropTypes.oneOf(['small']),
    samlUrl: PropTypes.string,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
  }

  render() {
    const { samlUrl, size } = this.props
    const redirectUrl = samlUrl || '/signin'
    return (
      <div
        className={classnames('auth flexCenter', {
          'auth--small': size === 'small',
        })}>
        <div className="auth-box flexColCenter">
          <div className="auth-logo flexCenter" />
          <div className="auth-message signout-message">
            User logged out, please log back in.
          </div>
          <Button
            onClick={e => {
              e.preventDefault()
              window.location = redirectUrl
            }}>
            Login
          </Button>
        </div>
      </div>
    )
  }
}

export default connect((state, ownProps) => {
  return {
    samlUrl: state.auth.samlUrl,
    size: ownProps.size,
  }
})(TimedLogout)
