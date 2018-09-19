import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ContextMenu from './ContextMenu'
import { resetContextMenuPos } from '../../actions/contextMenuActions'

export default connect(null, dispatch => ({
  actions: bindActionCreators({ resetContextMenuPos }, dispatch),
}))(ContextMenu)
