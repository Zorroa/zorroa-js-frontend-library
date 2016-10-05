import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Logo from '../../../components/Logo'
import * as actions from '../../../actions/authAction'

class Signout extends Component {
  static propTypes () {
    return {
      signoutUser: PropTypes.func.isRequired
    }
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  componentWillMount () {
    this.props.signoutUser()
  }

  render () {
    setTimeout(() => { this.context.router.push('/') }, 3000);
    return (
      <div className="auth">
        <div className="auth-logo">
          <Logo/>
        </div>
        <div className="auth-message">
          Logging out...
        </div>
      </div>
    )
  }
}

export default connect(null, actions)(Signout)
