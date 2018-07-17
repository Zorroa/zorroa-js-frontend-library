import { connect } from 'react-redux'
import Button from './Button'

export default connect(state => ({
  keyColor: state.theme.keyColor,
  whiteLabelEnabled: state.theme.whiteLabelEnabled,
}))(Button)
