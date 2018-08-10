import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getJobs } from '../../actions/jobActions'
import {
  hideExportInterface,
  postExportProfiles,
  loadExportProfiles,
  clearPostExportLoadingStates,
  exportRequest,
  onlineStatus,
  createExport,
  getProcessors,
} from '../../actions/exportsAction'
import Exports from './Exports'

export default connect(
  state => ({
    userEmail: state.auth.user.email,
    userFullName:
      `${state.auth.user.firstName} ${state.auth.user.lastName}`.trim() ||
      state.auth.user.email.split('@')[0],
    userId: state.auth.user.id,
    assetSearch: state.exports.assetSearch,
    hasRestrictedAssets: state.exports.hasRestrictedAssets,
    videoAssetCount: state.exports.videoAssetCount,
    imageAssetCount: state.exports.imageAssetCount,
    flipbookAssetCount: state.exports.flipbookAssetCount,
    documentAssetCount: state.exports.documentAssetCount,
    totalAssetCount: state.exports.totalAssetCount,
    selectedAssets: state.exports.exportPreviewAssets,
    shouldShow: state.exports.shouldShow,
    origin: state.auth.origin,
    exportProfiles: state.exports.exportProfiles,
    packageName: state.exports.packageName,
    exportProfilesPostingError: state.exports.exportProfilesPostingError,
    exportProfilesSuccess: state.exports.exportProfilesSuccess,
    exportProfilesPosting: state.exports.exportProfilesPosting,
    isLoading:
      state.exports.isLoading ||
      state.exports.loadingOnlineStatuses ||
      state.exports.loadingProcessors,
    exportRequestPosting: state.exports.exportRequestPosting,
    exportRequestPostingError: state.exports.exportRequestPostingError,
    exportRequestPostingSuccess: state.exports.exportRequestPostingSuccess,
    loadingCreateExport: state.exports.loadingCreateExport,
    loadingCreateExportError: state.exports.loadingCreateExportError,
    loadingCreateExportSuccess: state.exports.loadingCreateExportSuccess,
    onlineAssets: state.exports.onlineAssets,
    offlineAssets: state.exports.offlineAssets,
    errorMessage: state.exports.errorMessage,
    metadataFields: state.app.userSettings.metadataFields,
    maxExportableAssets: parseInt(
      state.archivist.settings['archivist.export.maxAssetCount'].currentValue,
      10,
    ),
    processors: state.exports.processors,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        hideExportInterface,
        loadExportProfiles,
        postExportProfiles,
        clearPostExportLoadingStates,
        exportRequest,
        createExport,
        onlineStatus,
        getProcessors,
        getJobs,
      },
      dispatch,
    ),
  }),
)(Exports)
