import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import User from '../../../models/User'
import Logo from '../../../components/Logo'
import * as actions from '../../../actions/authAction'

class Signout extends Component {
  static propTypes = {
    signoutUser: PropTypes.func.isRequired,
    host: PropTypes.string,
    user: PropTypes.instanceOf(User),
  }

  static get contextTypes() {
    return {
      router: PropTypes.object,
    }
  }

  componentWillMount() {
    const { host, user } = this.props
    this.props.signoutUser(user, host)
  }

  render() {
    setTimeout(() => {
      this.context.router.push('/')
    }, 1000)
    return (
      <div className="auth flexCenter">
        <div className="auth-box flexColCenter">
          <div className="auth-logo flexCenter">
            <Logo />
          </div>
          <div className="auth-message signout-message">Logging out...</div>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    host: state.auth.host,
    user: state.auth.user,
  }),
  actions,
)(Signout)
