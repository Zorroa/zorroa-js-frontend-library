import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'
import {
  isolateAssetId,
  searchAssets,
  getAssetFields,
} from '../../actions/assetsAction'
import { lightboxMetadata } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import Lightbox from './Lightbox'

const ConnectedLightbox = connect(
  state => ({
    assets: state.assets.all,
    lightboxMetadata: state.app.lightboxMetadata,
    user: state.auth.user,
    userSettings: state.app.userSettings,
    fieldTypes: state.assets.types,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateAssetId,
        lightboxMetadata,
        saveUserSettings,
        searchAssets,
        getAssetFields,
      },
      dispatch,
    ),
  }),
)(Lightbox)

export default withRouter(ConnectedLightbox)
