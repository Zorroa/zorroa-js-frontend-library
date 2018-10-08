import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { toggleDarkMode } from '../../actions/appActions'
import App from './App'

export default connect(
  state => {
    return {
      isDark: state.app.isDark,
    }
  },
  dispatch => ({
    actions: bindActionCreators(
      {
        toggleDarkMode,
      },
      dispatch,
    ),
  }),
)(App)
