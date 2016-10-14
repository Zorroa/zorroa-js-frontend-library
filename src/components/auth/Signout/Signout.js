import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import User from '../../../models/User'
import Logo from '../../../components/Logo'
import * as actions from '../../../actions/authAction'

class Signout extends Component {
  static propTypes () {
    return {
      signoutUser: PropTypes.func.isRequired,
      user: PropTypes.instanceOf(User)
    }
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  componentWillMount () {
    this.props.signoutUser(this.props.user)
  }

  render () {
    setTimeout(() => { this.context.router.push('/') }, 3000);
    return (
      <div className="auth">
        <div className="auth-box">
          <div className="auth-logo">
            <Logo/>
          </div>
          <div className="auth-message">
            Logging out...
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  user: state.auth.user
}), actions)(Signout)