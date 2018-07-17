import { connect } from 'react-redux'
import Checkbox from './Checkbox'

export default connect(state => ({
  keyColor: state.theme.keyColor,
  whiteLabelEnabled: state.theme.whiteLabelEnabled,
}))(Checkbox)
