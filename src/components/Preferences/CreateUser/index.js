import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import CreateUser from './CreateUser'
import { createUser, resetUser } from '../../../actions/usersActions'

export default connect(
  state => ({
    availablePermissions: state.permissions.all,
    user: state.users.user,
    createUserError: state.users.createUserError,
    createUserErrorMessage: state.users.createUserErrorMessage,
    isCreatingUser: state.users.isCreatingUser,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        createUser,
        resetUser,
      },
      dispatch,
    ),
  }),
)(CreateUser)
