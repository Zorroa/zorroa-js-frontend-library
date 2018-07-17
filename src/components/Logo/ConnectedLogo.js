import { connect } from 'react-redux'
import Logo from './Logo'

export default connect(state => ({
  darkLogo: state.theme.darkLogo,
  lightLogo: state.theme.lightLogo,
  whiteLabelEnabled: state.theme.whiteLabelEnabled,
  dark: state.app.monochrome,
}))(Logo)
