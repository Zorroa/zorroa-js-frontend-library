import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Theme from './Theme'

import { saveTheme } from '../../../actions/themeAction'

export default connect(
  state => ({ ...state.theme }),
  dispatch => ({
    actions: bindActionCreators(
      {
        saveTheme,
      },
      dispatch,
    ),
  }),
)(Theme)
