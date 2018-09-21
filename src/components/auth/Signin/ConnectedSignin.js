import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  signinUser,
  authError,
  clearAuthError,
} from '../../../actions/authAction'
import Signin from './Signin'

export default connect(
  state => ({
    error: state.auth.error,
    defaults: state.auth.defaults,
    authenticated: state.auth.authenticated,
    userSigninStatus: state.auth.userSigninStatus,
    userSigninErrorStatusCode: state.auth.userSigninErrorStatusCode,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        signinUser,
        authError,
        clearAuthError,
      },
      dispatch,
    ),
  }),
)(Signin)
