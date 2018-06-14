import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SharedMetadata from './SharedMetadata'
import { addTableLayout, selectTableLayout } from '../../../actions/appActions'
import { saveUserSettings } from '../../../actions/authAction'

import {
  fetchTableLayouts,
  deleteMetadataTableLayout,
} from '../../../actions/tableLayoutsAction'
import './SharedMetadata.scss'

export default connect(
  state => ({
    isAdministrator: state.auth.isAdministrator,
    sharedTableLayouts: state.tableLayouts.sharedTableLayouts,
    userSettings: state.app.userSettings,
    tableLayouts: state.app.tableLayouts,
    selectedTableLayoutId: state.app.selectedTableLayoutId,
    user: state.auth.user,
    isSavingSharedTableLayoutsErrorMessage:
      state.tableLayouts.isSavingSharedTableLayoutsErrorMessage,
    isFetchingSharedTableLayoutsError:
      state.tableLayouts.isFetchingSharedTableLayoutsError,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        addTableLayout,
        fetchTableLayouts,
        deleteMetadataTableLayout,
        saveUserSettings,
        selectTableLayout,
      },
      dispatch,
    ),
  }),
)(SharedMetadata)
