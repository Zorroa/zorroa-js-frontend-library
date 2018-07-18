import { connect } from 'react-redux'
import Table from './Table'

export default connect(state => ({
  keyColor: state.theme.keyColor,
  whiteLabelEnabled: state.theme.whiteLabelEnabled,
}))(Table)
