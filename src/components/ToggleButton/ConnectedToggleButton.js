import { connect } from 'react-redux'
import ToggleButton from './ToggleButton'

export default connect(state => ({
  dark: state.app.monochrome,
}))(ToggleButton)
