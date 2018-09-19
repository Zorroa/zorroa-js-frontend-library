import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import TableContextMenu from './TableContextMenu'
import { dismissTableContextMenu } from '../../../actions/contextMenuActions'

export default connect(null, dispatch => ({
  actions: bindActionCreators(
    {
      dismissTableContextMenu,
    },
    dispatch,
  ),
}))(TableContextMenu)
