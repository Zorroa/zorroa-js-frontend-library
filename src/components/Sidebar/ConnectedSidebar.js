import { connect } from 'react-redux'
import Sidebar from './Sidebar'

export default connect(state => ({
  whiteLabelEnabled: state.theme.whiteLabelEnabled,
  isDark: state.app.monochrome,
}))(Sidebar)
