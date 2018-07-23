import { connect } from 'react-redux'
import DropdownGroup from './DropdownGroup'

export default connect(state => ({
  dark: state.app.monochrome,
}))(DropdownGroup)
