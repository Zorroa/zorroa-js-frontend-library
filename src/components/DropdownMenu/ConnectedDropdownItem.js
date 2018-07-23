import { connect } from 'react-redux'
import DropdownItem from './DropdownItem'

export default connect(state => ({
  dark: state.app.monochrome,
}))(DropdownItem)
