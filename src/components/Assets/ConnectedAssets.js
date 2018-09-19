import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  isolateAssetId,
  selectAssetIds,
  searchAssets,
  updateParentTotals,
  unorderAssets,
  isolateParent,
} from '../../actions/assetsAction'
import {
  showTableContextMenu,
  showThumbContextMenu,
  showMetaContextMenu,
  dismissTableContextMenu,
  dismissThumbContextMenu,
  dismissMetaContextMenu,
} from '../../actions/contextMenuActions'
import { restoreFolders } from '../../actions/racetrackAction'
import { selectFolderIds } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'
import {
  setThumbSize,
  setThumbLayout,
  showTable,
  setTableHeight,
  showModal,
  hideModal,
  iconifyRightSidebar,
  showQuickview,
} from '../../actions/appActions'
import Assets from './Assets'

const ConnectedAssets = connect(
  state => ({
    assets: state.assets.all,
    assetsCounter: state.assets.assetsCounter,
    query: state.assets.query,
    order: state.assets.order,
    parentCounts: state.assets.parentCounts,
    parentTotals: state.assets.parentTotals,
    isolatedParent: state.assets.isolatedParent,
    isolatedId: state.assets.isolatedId,
    selectedIds: state.assets.selectedIds,
    selectionCounter: state.assets.selectionCounter,
    totalCount: state.assets.totalCount,
    loadedCount: state.assets.loadedCount,
    filteredCount: state.assets.filteredCount,
    rightSidebarIsIconified: state.app.rightSidebarIsIconified,
    folders: state.folders.all,
    trashedFolders: state.folders.trashedFolders,
    uxLevel: state.app.uxLevel,
    user: state.auth.user,
    userSettings: state.app.userSettings,
    thumbSize: state.app.thumbSize,
    layout: state.app.thumbLayout,
    showTable: state.app.showTable,
    tableHeight: state.app.tableHeight,
    widgets: state.racetrack.widgets,
    origin: state.auth.origin,
    showQuickview: state.app.showQuickview,
    isAdministrator: state.auth.isAdministrator,
    contextMenuPos: state.contextMenu.contextMenuPos,
    showTableCtxtMenu: state.contextMenu.showTableCtxtMenu,
    showThumbCtxtMenu: state.contextMenu.showThumbCtxtMenu,
    showMetaCtxtMenu: state.contextMenu.showMetaCtxtMenu,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateAssetId,
        isolateParent,
        selectAssetIds,
        searchAssets,
        updateParentTotals,
        unorderAssets,
        restoreFolders,
        selectFolderIds,
        setThumbSize,
        setThumbLayout,
        showTable,
        setTableHeight,
        showModal,
        hideModal,
        iconifyRightSidebar,
        saveUserSettings,
        showQuickview,
        showTableContextMenu,
        showThumbContextMenu,
        showMetaContextMenu,
        dismissTableContextMenu,
        dismissThumbContextMenu,
        dismissMetaContextMenu,
      },
      dispatch,
    ),
  }),
)(Assets)

export default withRouter(ConnectedAssets)
