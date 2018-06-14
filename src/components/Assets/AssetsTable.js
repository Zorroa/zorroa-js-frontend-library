import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Asset, { minimalUniqueFieldTitle } from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import User from '../../models/User'
import { unCamelCase } from '../../services/jsUtil'
import {
  updateTableLayouts,
  iconifyRightSidebar,
  addTableLayout,
  deleteTableLayout,
  selectTableLayout,
  showModal,
  hideModal,
} from '../../actions/appActions'
import { createFacetWidget, fieldUsedInWidget } from '../../models/Widget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { shareTableLayout } from '../../actions/tableLayoutsAction'
import {
  sortAssets,
  unorderAssets,
  isolateAssetId,
} from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import Table from '../Table'
import AclEntry from '../../models/Acl'
import FieldList from '../../models/FieldList'
import TableField from '../Table/TableField'
import TableSettings from '../Table/TableSettings'
import TableContextMenu from '../Table/TableContextMenu'
import {
  defaultTableFields,
  defaultTableFieldWidth,
} from '../../constants/defaultState'

class AssetsTable extends Component {
  static propTypes = {
    // app state
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assetsCounter: PropTypes.number.isRequired,
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectionCounter: PropTypes.number.isRequired,
    monochrome: PropTypes.bool,
    selectedTableLayoutId: PropTypes.string,
    tableLayouts: PropTypes.arrayOf(PropTypes.instanceOf(FieldList)),
    fieldTypes: PropTypes.object,
    assetFields: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object),
    order: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    isAdministrator: PropTypes.bool,
    isSavingSharedTableLayouts: PropTypes.object.isRequired,
    isSavingSharedTableLayoutsError: PropTypes.object.isRequired,
    isSavingSharedTableLayoutsSuccess: PropTypes.object.isRequired,

    // input props
    height: PropTypes.number.isRequired,
    tableIsResizing: PropTypes.bool.isRequired,
    selectFn: PropTypes.func.isRequired,

    // connect actions
    actions: PropTypes.shape({
      sortAssets: PropTypes.func.isRequired,
      unorderAssets: PropTypes.func.isRequired,
      isolateAssetId: PropTypes.func.isRequired,
      updateTableLayouts: PropTypes.func.isRequired,
      addTableLayout: PropTypes.func.isRequired,
      deleteTableLayout: PropTypes.func.isRequired,
      selectTableLayout: PropTypes.func.isRequired,
      modifyRacetrackWidget: PropTypes.func.isRequired,
      iconifyRightSidebar: PropTypes.func.isRequired,
      showModal: PropTypes.func.isRequired,
      hideModal: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
      shareTableLayout: PropTypes.func.isRequired,
    }).isRequired,

    // router props
    history: PropTypes.object,
  }

  static defaultProps = {
    isSavingSharedTableLayouts: {},
    isSavingSharedTableLayoutsError: {},
    isSavingSharedTableLayoutsSuccess: {},
  }

  state = {
    showSettings: false,
    showContextMenu: false,
    contextMenuPos: { x: 0, y: 0 },
    selectedFieldIndex: -1,
  }

  setFieldWidth = (field, width) => {
    const { actions, userSettings, selectedTableLayoutId } = this.props
    const tableLayouts = [...this.props.tableLayouts]
    const index = this.getTableLayoutIndexById(selectedTableLayoutId)
    let settings = userSettings
    if (index >= 0) {
      const layout = new FieldList(tableLayouts[index])
      layout.widths = { ...layout.widths, [field]: width }
      tableLayouts[index] = layout
      actions.updateTableLayouts(tableLayouts)
      settings = { ...userSettings, tableLayouts }
      if (this.saveTimer) clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => this.saveTableFieldWidth(settings), 500)
    }
  }

  saveTableFieldWidth = settings => {
    this.props.actions.saveUserSettings(this.props.user, settings)
  }

  columnAutoResize = (field, asset) => {
    const { monochrome } = this.props
    var test = document.getElementById('Table-cell-test')
    var maxWidth = 0

    // measure the largest cell in this column
    test.innerHTML = ReactDOMServer.renderToString(
      <TableField dark={monochrome} {...{ asset, field, isOpen: false }} />,
    )
    maxWidth = Math.max(maxWidth, test.clientWidth)

    // include the header!
    test.innerHTML = unCamelCase(Asset.lastNamespace(field))
    maxWidth = Math.max(maxWidth, test.clientWidth)

    test.innerHTML = '' // clean up

    return maxWidth
  }

  isolateToLightbox = asset => {
    this.props.actions.isolateAssetId(asset.id, this.props.history)
  }

  // light wrapper around Assets.select(); just make sure we don't scroll
  // the Table when we select from the table
  select = (asset, event) => {
    this.props.selectFn(asset, event)
  }

  // Rotate through on -> off -> unordered
  sortByField = field => {
    const { order } = this.props
    let ascending = true
    if (order) {
      const index = order && order.findIndex(order => order.field === field)
      if (index >= 0) {
        ascending = order[index].ascending ? false : undefined
      }
    }
    if (ascending === undefined) {
      this.props.actions.unorderAssets()
    } else {
      this.props.actions.sortAssets(field, ascending)
    }
  }

  updateFields = fields => {
    const { actions, user, userSettings, selectedTableLayoutId } = this.props
    const tableLayouts = [...this.props.tableLayouts]
    const index = this.getTableLayoutIndexById(selectedTableLayoutId)
    if (index >= 0) {
      const layout = new FieldList(tableLayouts[index])
      layout.fields = [...fields]
      tableLayouts[index] = layout
      actions.updateTableLayouts(tableLayouts)
      actions.saveUserSettings(user, { ...userSettings, tableLayouts })
    }
  }

  getTableLayoutById(id) {
    const tableLayouts = [...this.props.tableLayouts]
    return tableLayouts.find(layout => layout.id === id)
  }

  getTableLayoutIndexById(id) {
    const tableLayouts = [...this.props.tableLayouts]
    return tableLayouts.findIndex(layout => layout.id === id)
  }

  duplicateTableLayout = event => {
    const { actions, user, userSettings } = this.props
    const tableLayouts = [...this.props.tableLayouts]
    const layout = this.getTableLayoutById(this.props.selectedTableLayoutId)
    if (layout) {
      const acl = [
        new AclEntry({
          permissionId: user.permissionId,
          access: AclEntry.ReadAccess | AclEntry.WriteAccess,
        }),
      ]
      const name = `${layout.name} (copy)`
      const id = isNaN(parseInt(layout.id))
        ? `${layout.id}1`
        : String(parseInt(layout.id) + 1)
      const dup = new FieldList({ ...layout, acl, name, id })
      const selectedTableLayoutId = dup.id
      tableLayouts.push(dup)
      actions.addTableLayout(dup)
      actions.saveUserSettings(user, {
        ...userSettings,
        tableLayouts,
        selectedTableLayoutId,
      })
    }
  }

  shareTableLayout = () => {
    const { selectedTableLayoutId } = this.props
    const layout = this.getTableLayoutById(selectedTableLayoutId)
    this.props.actions.shareTableLayout(
      layout.name,
      layout.fields,
      selectedTableLayoutId,
    )
  }

  deleteTableLayout = event => {
    this.props.actions.deleteTableLayout(this.props.selectedTableLayoutId)

    // Remove layout from user settings
    const { actions, user, userSettings } = this.props
    const tableLayouts = [...this.props.tableLayouts]
    let selectedTableLayoutId = this.props.selectedTableLayoutId
    const index = this.getTableLayoutIndexById(selectedTableLayoutId)
    if (index >= 0) {
      if (index === 0) selectedTableLayoutId = tableLayouts[0].id
      else selectedTableLayoutId = tableLayouts[index - 1].id
      tableLayouts.splice(index, 1)
      actions.saveUserSettings(user, {
        ...userSettings,
        tableLayouts,
        selectedTableLayoutId,
      })
    }
  }

  selectTableLayout = layout => {
    const { actions, user, userSettings } = this.props
    actions.selectTableLayout(layout.id)
    actions.saveUserSettings(user, {
      ...userSettings,
      selectedTableLayoutId: layout.id,
    })
  }

  renameTableLayout = (layoutId, name) => {
    if (!name.trim().length) return
    const { actions, user, userSettings } = this.props
    const index = this.getTableLayoutIndexById(layoutId)
    if (index < 0) return
    const tableLayouts = [...this.props.tableLayouts]
    tableLayouts[index] = new FieldList({ ...tableLayouts[index], name })
    actions.updateTableLayouts(tableLayouts)
    actions.saveUserSettings(user, { ...userSettings, tableLayouts })
  }

  showModal = modal => {
    this.props.actions.showModal(modal)
  }
  hideModal = () => {
    this.props.actions.hideModal()
  }

  showContextMenu = (selectedFieldIndex, event) => {
    event.preventDefault()
    this.setState({
      selectedFieldIndex,
      showContextMenu: true,
      contextMenuPos: { x: event.pageX, y: event.pageY },
    })
  }

  dismissContextMenu = event => {
    if (event) event.preventDefault()
    this.setState({ showContextMenu: false })
  }

  createTagFacet = (term, field, event) => {
    const fieldType = this.props.fieldTypes[field]
    field = field && field.endsWith('.raw') ? field : field + '.raw'
    const index = this.props.widgets.findIndex(widget =>
      fieldUsedInWidget(field, widget),
    )
    let terms = [term]
    if (index >= 0 && event.shiftKey) {
      // Add to terms for shift
      const widget = this.props.widgets[index]
      if (widget.sliver && widget.sliver.filter && widget.sliver.filter.terms) {
        terms = [...widget.sliver.filter.terms[field], term]
      }
    }
    const widget = createFacetWidget(field, fieldType, terms)
    if (index >= 0) widget.id = this.props.widgets[index].id
    this.props.actions.modifyRacetrackWidget(widget)
    this.props.actions.iconifyRightSidebar(false)
    event.stopPropagation()
  }

  renderTitle(field, fields) {
    const { head, tails } = minimalUniqueFieldTitle(field, fields, 0)
    const tail = tails && '\u2039 ' + tails.join(' \u2039 ')
    return (
      <div className="Table-title">
        <div className="Table-title-head">{unCamelCase(head)}</div>
        {tail && <div className="Table-title-tail">{tail}</div>}
      </div>
    )
  }

  fieldOrder = field => {
    const { order } = this.props
    if (!order) return
    const index = order.findIndex(order => order.field === field)
    if (index !== 0) return
    return order[index].ascending ? 'ascending' : 'descending'
  }

  renderElement = (asset, field, width, leftPx, order) => {
    const { monochrome } = this.props
    return (
      <TableField
        dark={monochrome}
        order={order}
        {...{
          asset,
          field,
          key: field,
          width,
          left: `${leftPx}px`,
          top: `0px`,
        }}
        onTag={this.createTagFacet}
      />
    )
  }

  getReasonsForDisabledDeleteAction({ isLastLayout, isReadOnly }) {
    if (isLastLayout) {
      return 'Cannot delete the last saved layout'
    }

    if (isReadOnly) {
      return 'Cannot delete a read-only layout'
    }
  }

  getReasonsForDisabledShareAction({ needsPermissions, alreadyAdded }) {
    if (needsPermissions) {
      return 'Insufficient permissions to share layouts'
    }

    if (alreadyAdded) {
      return 'The layout has already been shared'
    }
  }

  renderSettings(fields, layout) {
    const {
      tableLayouts,
      user,
      assetFields,
      selectedTableLayoutId,
      isAdministrator,
    } = this.props
    if (!this.state.showSettings) return
    const selectedLayoutHasWritePermission =
      layout && layout.hasAccess(user, AclEntry.WriteAccess)
    const hasSharePermissions = isAdministrator === true
    const hasSharedLayout =
      this.props.isSavingSharedTableLayoutsSuccess[layout.id] === true
    const hasSharedLayoutError =
      this.props.isSavingSharedTableLayoutsError[layout.id] === true

    let sharedLayoutLabel = 'Share Layout'

    if (hasSharedLayout) {
      sharedLayoutLabel = `${sharedLayoutLabel} (Succesfully Shared)`
    }

    if (hasSharedLayoutError) {
      sharedLayoutLabel = `${sharedLayoutLabel} (Error: Unable To Share)`
    }

    const layoutActions = [
      {
        label: 'Duplicate Layout',
        fn: this.duplicateTableLayout,
        disabled: false,
      },
      {
        label: 'Delete Layout',
        fn: this.deleteTableLayout,
        disabled: tableLayouts.length <= 1 || !selectedLayoutHasWritePermission,
        disabledReason: this.getReasonsForDisabledDeleteAction({
          isLastLayout: tableLayouts.length <= 1,
          isReadOnly: !selectedLayoutHasWritePermission,
        }),
      },
      {
        label: sharedLayoutLabel,
        fn: this.shareTableLayout,
        disabled: hasSharePermissions === false || hasSharedLayout,
        disabledReason: this.getReasonsForDisabledShareAction({
          needsPermissions: hasSharePermissions === false,
          alreadyAdded: hasSharedLayout,
        }),
      },
    ]
    const allFieldNames = []
    Object.keys(assetFields).forEach(type =>
      assetFields[type].forEach(field => allFieldNames.push(field)),
    )
    return (
      <div>
        <div
          className="Table-context-background"
          onClick={() => this.setState({ showSettings: false })}
          onContextMenu={() => this.setState({ showSettings: false })}
        />
        <TableSettings
          fields={fields}
          allFieldNames={allFieldNames}
          tableLayouts={tableLayouts}
          selectedTableLayoutId={selectedTableLayoutId}
          user={user}
          layoutActions={layoutActions}
          updateFieldsFn={this.updateFields}
          selectTableLayoutFn={this.selectTableLayout}
          renameTableLayoutFn={this.renameTableLayout}
          showModalFn={this.showModal}
          hideModalFn={this.hideModal}
        />
      </div>
    )
  }

  renderContextMenu(fields) {
    const { contextMenuPos, selectedFieldIndex } = this.state
    if (!this.state.showContextMenu) return
    return (
      <TableContextMenu
        fields={fields}
        contextMenuPos={contextMenuPos}
        selectedFieldIndex={selectedFieldIndex}
        onDismiss={this.dismissContextMenu}
        updateFieldsFn={this.updateFields}
      />
    )
  }

  render() {
    const {
      assets,
      assetsCounter,
      selectedAssetIds,
      selectionCounter,
      tableLayouts,
      selectedTableLayoutId,
      tableIsResizing,
      height,
      selectFn,
    } = this.props
    const layout =
      tableLayouts && this.getTableLayoutById(selectedTableLayoutId)
    const tableFields = (layout && layout.fields) || defaultTableFields
    const fields = tableFields.map(field => ({
      field: field,
      title: this.renderTitle(field, tableFields),
      order: this.fieldOrder(field),
      width:
        (layout && layout.widths && layout.widths[field]) ||
        defaultTableFieldWidth,
    }))
    return (
      <div>
        <Table
          assets={assets}
          assetsCounter={assetsCounter}
          selectedAssetIds={selectedAssetIds}
          selectionCounter={selectionCounter}
          fields={fields}
          height={height}
          tableIsResizing={tableIsResizing}
          onSettings={() => this.setState({ showSettings: true })}
          onColumnHeaderContextMenu={this.showContextMenu}
          selectFn={selectFn}
          isolateFn={this.isolateToLightbox}
          autoResizeFieldFn={this.columnAutoResize}
          setFieldWidthFn={this.setFieldWidth}
          fieldOrderFn={this.fieldOrder}
          sortFieldFn={this.sortByField}
          elementFn={this.renderElement}>
          {this.renderSettings(fields, layout)}
          {this.renderContextMenu(fields)}
        </Table>
      </div>
    )
  }
}

const ConnectedAssetsTable = connect(
  state => ({
    assets: state.assets.all,
    assetsCounter: state.assets.assetsCounter,
    selectedAssetIds: state.assets.selectedIds,
    selectionCounter: state.assets.selectionCounter,
    query: state.assets.query,
    order: state.assets.order,
    monochrome: state.app.monochrome,
    selectedTableLayoutId: state.app.selectedTableLayoutId,
    tableLayouts: state.app.tableLayouts,
    fieldTypes: state.assets.types,
    assetFields: state.assets.fields,
    widgets: state.racetrack.widgets,
    user: state.auth.user,
    userSettings: state.app.userSettings,
    isAdministrator: state.auth.isAdministrator,
    isSavingSharedTableLayouts: state.tableLayouts.isSavingSharedTableLayouts,
    isSavingSharedTableLayoutsError:
      state.tableLayouts.isSavingSharedTableLayoutsError,
    isSavingSharedTableLayoutsSuccess:
      state.tableLayouts.isSavingSharedTableLayoutsSuccess,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        sortAssets,
        unorderAssets,
        isolateAssetId,
        updateTableLayouts,
        addTableLayout,
        deleteTableLayout,
        selectTableLayout,
        modifyRacetrackWidget,
        iconifyRightSidebar,
        showModal,
        hideModal,
        saveUserSettings,
        shareTableLayout,
      },
      dispatch,
    ),
  }),
)(AssetsTable)

export default withRouter(ConnectedAssetsTable)
