import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import ChangePassword from '../ChangePassword'
import { resetPassword } from '../../../actions/authAction'

class ResetPassword extends Component {
  static propTypes = {
    actions: PropTypes.object,
    error: PropTypes.string,
    location: PropTypes.object
  }

  static get contextTypes () {
    return {
      router: PropTypes.object
    }
  }

  changePassword = (password) => {
    const token = this.props.location && this.props.location.query && this.props.location.query.token
    const protocol = window.location.protocol
    const host = window.location.hostname
    this.props.actions.resetPassword(password, token, protocol, host)
  }

  cancel = (event) => {
    this.context.router.push('/')
  }

  render () {
    return (
      <ChangePassword
        onChangePassword={this.changePassword}
        onCancel={this.cancel}
        fullscreen={true}
        error={this.props.error}/>
    )
  }
}

export default connect(state => ({
  error: state.auth.error
}), dispatch => ({
  actions: bindActionCreators({
    resetPassword
  }, dispatch)
}))(ResetPassword)
