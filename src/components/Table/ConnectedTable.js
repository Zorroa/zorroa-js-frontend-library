import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Table from './Table'
import {
  showTableContextMenu,
  showMetaContextMenu,
} from '../../actions/contextMenuActions'

export default connect(
  state => ({
    keyColor: state.theme.keyColor,
    whiteLabelEnabled: state.theme.whiteLabelEnabled,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        showMetaContextMenu,
        showTableContextMenu,
      },
      dispatch,
    ),
  }),
)(Table)
