import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import AssetContextMenu from './AssetContextMenu'
import { isolateAssetId } from '../../../actions/assetsAction'

const ConnectedAssetsTable = connect(
  state => ({
    origin: state.auth.origin,
    assets: state.assets.all,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateAssetId,
      },
      dispatch,
    ),
  }),
)(AssetContextMenu)

export default withRouter(ConnectedAssetsTable)
