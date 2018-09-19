import { connect } from 'react-redux'
import AssetContextMenu from './AssetContextMenu'

export default connect(state => ({
  origin: state.auth.origin,
  assets: state.assets.all,
}))(AssetContextMenu)
