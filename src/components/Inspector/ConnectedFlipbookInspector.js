import {
  setFlipbookFps,
  shouldLoop,
  lightboxMetadata,
  shouldHold as actionShouldHold,
} from '../../actions/appActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import FlipbookInspector from './FlipbookInspector'
import { saveUserSettings } from '../../actions/authAction'
import { getAssetFields } from '../../actions/assetsAction'

export default connect(
  state => ({
    fps: state.app.flipbookFps,
    shouldLoop: state.app.shouldLoop,
    shouldHold: state.app.shouldHold,
    isolatedAsset: state.assets.all.find(
      asset => asset.id === state.assets.isolatedId,
    ),
    lightboxMetadata: state.app.lightboxMetadata,
    user: state.auth.user,
    userSettings: state.app.userSettings,
    metadataFields: state.app.metadataFields,
    widgets: state.racetrack.widgets,
    collapsibleOpen: state.app.collapsibleOpen,
    fieldTypes: state.assets.types,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        setFlipbookFps,
        shouldLoop,
        lightboxMetadata,
        saveUserSettings,
        getAssetFields,
        shouldHold: actionShouldHold,
      },
      dispatch,
    ),
  }),
)(FlipbookInspector)
