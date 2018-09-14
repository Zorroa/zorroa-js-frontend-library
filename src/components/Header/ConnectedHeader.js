import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  showModal,
  hideModal,
  dialogAlertPromise,
  showPreferencesModal,
} from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { archivistInfo } from '../../actions/archivistAction'
import { selectAssetIds, findSimilarFields } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import detectLoginSource from '../../services/detectLoginSource'
import Header from './Header'

export default connect(
  state => {
    const isSaml = detectLoginSource(state.auth.source) === 'saml'
    const signoutUrl = isSaml ? '/saml/logout?local=true' : '/signout'

    return {
      sync: state.auth.sync,
      user: state.auth.user,
      isDeveloper: state.auth.isDeveloper,
      isAdministrator: state.auth.isAdministrator,
      monochrome: state.app.monochrome,
      assets: state.assets.all,
      selectedIds: state.assets.selectedIds,
      totalCount: state.assets.totalCount,
      loadedCount: state.assets.loadedCount,
      assetFields: state.assets.fields,
      similarFields: state.assets.similarFields,
      similarMinScore: state.racetrack.similarMinScore,
      userSettings: state.app.userSettings,
      widgets: state.racetrack.widgets,
      archivistInfo: state.archivist.info,
      tutorialUrl: state.theme.tutorialUrl,
      releaseNotesUrl: state.theme.releaseNotesUrl,
      faqUrl: state.theme.faqUrl,
      supportUrl: state.theme.supportUrl,
      shouldShowLogout: state.auth.shouldShowLogout,
      whiteLabelEnabled: state.theme.whiteLabelEnabled,
      signoutUrl,
    }
  },
  dispatch => ({
    actions: bindActionCreators(
      {
        archivistInfo,
        showModal,
        hideModal,
        selectAssetIds,
        saveUserSettings,
        dialogAlertPromise,
        findSimilarFields,
        resetRacetrackWidgets,
        showPreferencesModal,
      },
      dispatch,
    ),
  }),
)(Header)
