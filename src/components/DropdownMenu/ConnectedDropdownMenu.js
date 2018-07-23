import { connect } from 'react-redux'
import DropdownMenu from './DropdownMenu'

export default connect(state => ({
  dark: state.app.monochrome,
}))(DropdownMenu)
