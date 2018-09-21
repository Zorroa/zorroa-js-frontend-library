import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { forgotPassword, authError } from '../../../actions/authAction'
import ForgotPassword from './ForgotPassword'

const ConnectedForgotPassword = connect(
  state => ({
    user: state.auth.user,
    error: state.auth.error,
    passwordResetStatus: state.auth.passwordResetRequestStatus,
  }),
  dispatch => ({
    actions: bindActionCreators({ forgotPassword, authError }, dispatch),
  }),
)(ForgotPassword)

export default withRouter(ConnectedForgotPassword)
