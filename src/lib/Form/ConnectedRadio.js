import { connect } from 'react-redux'
import Radio from './Radio'

export default connect(state => ({
  keyColor: state.theme.keyColor,
  whiteLabelEnabled: state.theme.whiteLabelEnabled,
}))(Radio)
