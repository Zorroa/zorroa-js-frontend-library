import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { modifyRacetrackWidget } from '../../../actions/racetrackAction'

import Multipage from './Multipage'

const ConnectedMultipage = connect(
  state => ({
    isolatedParent: state.assets.isolatedParent,
    widgets: state.racetrack.widgets,
    origin: state.auth.origin,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        modifyRacetrackWidget,
      },
      dispatch,
    ),
  }),
)(Multipage)

export default ConnectedMultipage
