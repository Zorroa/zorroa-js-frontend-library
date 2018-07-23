import { connect } from 'react-redux'
import DropdownFontIcon from './DropdownFontIcon'

export default connect(state => ({
  dark: state.app.monochrome,
}))(DropdownFontIcon)
