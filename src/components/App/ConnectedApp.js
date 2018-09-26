import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchTheme } from '../../actions/themeAction'
import { samlOptionsRequest, checkSession } from '../../actions/authAction'
import App from './App'

export default connect(
  state => {
    return {
      authenticated: state.auth.authenticated,
      themeLoadState: state.theme.themeLoadState,
      sessionExpired: state.auth.sessionExpired,
    }
  },
  dispatch => ({
    actions: bindActionCreators(
      {
        fetchTheme,
        samlOptionsRequest,
        checkSession,
      },
      dispatch,
    ),
  }),
)(App)
