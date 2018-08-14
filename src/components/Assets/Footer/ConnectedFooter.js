import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { saveUserSettings } from '../../../actions/authAction'
import {
  setThumbSize,
  setThumbLayout,
  showTable,
} from '../../../actions/appActions'
import Footer from './Footer'

const ConnectedFooter = connect(
  state => ({
    uxLevel: state.app.uxLevel,
    user: state.auth.user,
    userSettings: state.app.userSettings,
    thumbSize: state.app.thumbSize,
    layout: state.app.thumbLayout,
    showTable: state.app.showTable,
    showQuickview: state.app.showQuickview,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        setThumbSize,
        setThumbLayout,
        showTable,
        saveUserSettings,
      },
      dispatch,
    ),
  }),
)(Footer)

export default withRouter(ConnectedFooter)
