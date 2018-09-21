import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { resetPassword } from '../../../actions/authAction'
import ResetPassword from './ResetPassword'

const ConnectedResetPassword = connect(
  state => ({
    error: state.auth.error,
    passwordResetStatus: state.auth.passwordResetStatus,
    passwordResetErrorCause: state.auth.passwordResetErrorCause,
    passwordResetErrorMessage: state.auth.passwordResetErrorMessage,
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
