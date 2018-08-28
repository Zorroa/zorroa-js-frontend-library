import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Filetype from './Filetype'
import { modifyRacetrackWidget } from '../../../actions/racetrackAction'
import { showModal } from '../../../actions/appActions'

export default connect(
  state => ({
    aggs: state.assets && state.assets.aggs,
    widgets: state.racetrack && state.racetrack.widgets,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        modifyRacetrackWidget,
        showModal,
      },
      dispatch,
    ),
  }),
)(Filetype)
