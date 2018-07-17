import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchTheme } from '../../actions/themeAction'
import App from './App'

export default connect(
  state => {
    return {
      authenticated: state.auth.authenticated,
      themeLoadState: state.theme.themeLoadState,
    }
  },
  dispatch => ({
    actions: bindActionCreators(
      {
        fetchTheme,
      },
      dispatch,
    ),
  }),
)(App)
