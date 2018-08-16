import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { saveUserSettings } from '../../actions/authAction'
import Metadata from './Metadata'
import {
  modifyRacetrackWidget,
  removeRacetrackWidgetIds,
} from '../../actions/racetrackAction'
import {
  iconifyRightSidebar,
  toggleCollapsible,
  hoverField,
  clearHoverField,
} from '../../actions/appActions'

export default connect(
  state => ({
    assets: state.assets.all,
    isolatedId: state.assets.isolatedId,
    metadataFields: state.app.metadataFields,
    widgets: state.racetrack.widgets,
    collapsibleOpen: state.app.collapsibleOpen,
    fieldTypes: state.assets.types,
    user: state.auth.user,
    userSettings: state.app.userSettings,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        iconifyRightSidebar,
        saveUserSettings,
        toggleCollapsible,
        modifyRacetrackWidget,
        removeRacetrackWidgetIds,
        hoverField,
        clearHoverField,
      },
      dispatch,
    ),
  }),
)(Metadata)
