import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset, { minimalUniqueFieldTitle } from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import User from '../../models/User'
import { unCamelCase } from '../../services/jsUtil'
import { setTableFieldWidth, iconifyRightSidebar } from '../../actions/appActions'
import { createFacetWidget, fieldUsedInWidget } from '../../models/Widget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { sortAssets, unorderAssets, isolateAssetId } from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import TableField from '../Table/TableField'
import Table from '../Table'
import { defaultMetadataFields } from '../../reducers/appReducer'

class AssetsTable extends Component {
  static propTypes = {
    // app state
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assetsCounter: PropTypes.number.isRequired,
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectionCounter: PropTypes.number.isRequired,
    monochrome: PropTypes.bool,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    fieldWidth: PropTypes.objectOf(PropTypes.number).isRequired,
    fieldTypes: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object),
    order: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),

    // input props
    height: PropTypes.number.isRequired,
    tableIsResizing: PropTypes.bool.isRequired,
    selectFn: PropTypes.func.isRequired,

    // connect actions
    actions: PropTypes.object
  }

  setFieldWidth = (field, width) => {
    this.props.actions.setTableFieldWidth({[field]: width})
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(_ => this.saveTableFieldWidth(field, width), 500)
  }

  saveTableFieldWidth = (field, width) => {
    const { userSettings, actions, user } = this.props
    const tableFieldWidths = { ...userSettings.tableFieldWidths, [field]: width }
    const settings = { ...userSettings, tableFieldWidths }
    actions.saveUserSettings(user, settings)
    this.saveTimer = null
  }

  columnAutoResize = (field, asset) => {
    const { monochrome } = this.props
    var test = document.getElementById('Table-cell-test')
    var maxWidth = 0

    // measure the largest cell in this column
    test.innerHTML = ReactDOMServer.renderToString(<TableField dark={monochrome} {...{ asset, field, isOpen: false }}/>)
    maxWidth = Math.max(maxWidth, test.clientWidth)

    // include the header!
    test.innerHTML = unCamelCase(Asset.lastNamespace(field))
    maxWidth = Math.max(maxWidth, test.clientWidth)

    test.innerHTML = '' // clean up

    return maxWidth
  }

  isolateToLightbox = (asset) => {
    this.props.actions.isolateAssetId(asset.id)
  }

  // light wrapper around Assets.select(); just make sure we don't scroll
  // the Table when we select from the table
  select = (asset, event) => {
    this.props.selectFn(asset, event)
  }

  // Rotate through on -> off -> unordered
  sortByField = (field) => {
    console.log('Sort by ' + field)
    const { order } = this.props
    let ascending = true
    if (order) {
      const index = order && order.findIndex(order => (order.field === field))
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

  createTagFacet = (term, field, event) => {
    const fieldType = this.props.fieldTypes[field]
    field = field && field.endsWith('.raw') ? field : field + '.raw'
    const index = this.props.widgets.findIndex(widget => fieldUsedInWidget(field, widget))
    let terms = [term]
    if (index >= 0 && event.shiftKey) {       // Add to terms for shift
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

  renderTitle (field, fields) {
    const { head, tails } = minimalUniqueFieldTitle(field, fields, 0)
    const tail = tails && '\u2039 ' + tails.join(' \u2039 ')
    return (
      <div className="Table-title">
        <div className="Table-title-head">{unCamelCase(head)}</div>
        { tail && <div className="Table-title-tail">{tail}</div> }
      </div>
    )
  }

  fieldOrder = (field) => {
    const { order } = this.props
    if (!order) return
    const index = order.findIndex(order => (order.field === field))
    if (index < 0) return
    return order[index].ascending ? 'ascending' : 'descending'
  }

  renderElement = (asset, field, width, leftPx, order) => {
    const { monochrome } = this.props
    return <TableField dark={monochrome} order={order}
                       {...{ asset, field, key: field, width, left: `${leftPx}px`, top: `0px` }}
                       onTag={this.createTagFacet} />
  }

  render () {
    const { assets, assetsCounter, selectedAssetIds, selectionCounter, fieldWidth, tableIsResizing, height, selectFn } = this.props
    const fieldNames = this.props.fields && this.props.fields.length ? this.props.fields : defaultMetadataFields
    const fields = fieldNames.map(field => ({
      field: field,
      title: this.renderTitle(field, fieldNames),
      order: this.fieldOrder(field),
      width: fieldWidth[field]
    }))
    return <Table assets={assets}
                  assetsCounter={assetsCounter}
                  selectedAssetIds={selectedAssetIds}
                  selectionCounter={selectionCounter}
                  fields={fields}
                  height={height}
                  tableIsResizing={tableIsResizing}
                  selectFn={selectFn}
                  isolateFn={this.isolateToLightbox}
                  autoResizeFieldFn={this.columnAutoResize}
                  setFieldWidthFn={this.setFieldWidth}
                  fieldOrderFn={this.fieldOrder}
                  sortFieldFn={this.sortByField}
                  elementFn={this.renderElement} />
  }
}

export default connect(state => ({
  assets: state.assets.all,
  assetsCounter: state.assets.assetsCounter,
  selectedAssetIds: state.assets.selectedIds,
  selectionCounter: state.assets.selectionCounter,
  query: state.assets.query,
  order: state.assets.order,
  monochrome: state.app.monochrome,
  fields: state.app.metadataFields,
  fieldWidth: state.app.tableFieldWidth,
  fieldTypes: state.assets.types,
  widgets: state.racetrack.widgets,
  user: state.auth.user,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    sortAssets,
    unorderAssets,
    isolateAssetId,
    setTableFieldWidth,
    modifyRacetrackWidget,
    iconifyRightSidebar,
    saveUserSettings
  }, dispatch)
}))(AssetsTable)
