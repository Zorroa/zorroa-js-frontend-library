import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import domUtils from '../../../services/domUtils'
import ChangePassword from '../ChangePassword'
import { resetPassword } from '../../../actions/authAction'

class ResetPassword extends Component {
  static propTypes = {
    actions: PropTypes.object,
    error: PropTypes.string,
    location: PropTypes.object,
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
    }),
  }

  static get contextTypes() {
    return {
      router: PropTypes.object,
    }
  }

  changePassword = password => {
    const token = domUtils.parseQueryString(this.props.location.search).token
    const origin = window.location.origin
    this.props.actions.resetPassword(password, token, origin)
  }

  cancel = event => {
    this.props.history.goBack()
  }

  render() {
    return (
      <ChangePassword
        onChangePassword={this.changePassword}
        onCancel={this.cancel}
        error={this.props.error}
      />
    )
  }
}

const ConnectedResetPassword = connect(
  state => ({
    error: state.auth.error,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        resetPassword,
      },
      dispatch,
    ),
  }),
)(ResetPassword)

export default withRouter(ConnectedResetPassword)
