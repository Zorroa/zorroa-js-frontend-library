import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { selectJobIds } from '../../../actions/jobActions'
import { unorderAssets, isolateParent } from '../../../actions/assetsAction'
import { selectFolderIds } from '../../../actions/folderAction'
import { resetRacetrackWidgets } from '../../../actions/racetrackAction'

import ZeroState from './ZeroState'

const ConnectedAssetsZeroState = connect(
  state => ({
    assets: state.assets.all,
    query: state.assets.query,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        resetRacetrackWidgets,
        selectFolderIds,
        unorderAssets,
        selectJobIds,
        isolateParent,
      },
      dispatch,
    ),
  }),
)(ZeroState)

export default ConnectedAssetsZeroState
