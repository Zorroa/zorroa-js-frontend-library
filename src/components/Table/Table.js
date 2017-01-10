import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import User from '../../models/User'
import { unCamelCase } from '../../services/jsUtil'
import {
  updateMetadataFields,
  updateTableFields,
  showModal,
  setTableFieldWidth
} from '../../actions/appActions'
import { sortAssets } from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import TableField from './TableField'
import DisplayOptions from '../DisplayOptions'
import Resizer from '../../services/Resizer'

const rowHeightPx = 30
const tableHeaderHeight = 26

class Table extends Component {
  static propTypes = {
    // app state
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assetsCounter: PropTypes.number.isRequired,
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectionCounter: PropTypes.number.isRequired,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    fieldWidth: PropTypes.objectOf(PropTypes.number).isRequired,
    order: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.instanceOf(User),
    metadataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    query: PropTypes.instanceOf(AssetSearch),

    // input props
    height: PropTypes.number.isRequired,
    tableIsResizing: PropTypes.bool.isRequired,
    selectFn: PropTypes.func.isRequired,

    // connect actions
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      tableScrollTop: 0,
      tableScrollHeight: 0,
      assetFieldOpen: {}
    }

    this.columnResizeFieldName = null
    this.allowColumnResize = true
    this.assetsCounter = 0
    this.rowBottomPx = []
    this.assetRow = null
    this.selectionCounter = 0
    this.skipNextSelectionScroll = false
    this.resizer = null
  }

  showDisplayOptions = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Table Display Options'
                                 syncLabel='Metadata'
                                 singleSelection={false}
                                 fieldTypes={null}
                                 selectedFields={this.props.fields}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
    event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const { metadataFields, query, user, actions } = this.props
    const { syncedViews, checkedNamespaces } = state
    // console.log('Update table display options to:\n' + JSON.stringify(state.checkedNamespaces))
    actions.updateTableFields(checkedNamespaces)
    if (syncedViews) {
      actions.updateMetadataFields(checkedNamespaces)
    }
    actions.saveUserSettings(user, checkedNamespaces,
      syncedViews ? checkedNamespaces : metadataFields, query)
  }

  tableScroll = (event) => {
    // Horizontal scrolling for the table header,
    // keep the header in perfect sync with the table body's horiz scroll
    document.getElementsByClassName('Table-header')[0].style.left =
      `-${event.target.scrollLeft}px`

    this.setState({tableScrollTop: event.target.scrollTop, tableScrollHeight: event.target.clientHeight})
  }

  componentWillMount = () => { this.resizer = new Resizer() }
  componentWillUmount = () => { this.resizer.release() }

  columnResizeStart = (event, field) => {
    this.columnResizeFieldName = field
    this.resizer.capture(this.columnResizeUpdate, this.columnResizeStop,
      this.props.fieldWidth[field], 0)
  }

  columnResizeUpdate = (resizeX, resizeY) => {
    // let's just completely skip events that happen while we're busy
    if (!this.allowColumnResize) return false
    this.allowColumnResize = false

    var fieldWidth = Math.min(2000, Math.max(50, resizeX))
    this.props.actions.setTableFieldWidth({[this.columnResizeFieldName]: fieldWidth})
    // wait one frame to finish the event, otherwise events queue up syncronously
    requestAnimationFrame(_ => { this.allowColumnResize = true })
  }

  columnResizeStop = (event) => {
    this.allowColumnResize = true
    this.columnResizeFieldName = null
  }

  columnAutoResize = (event, field) => {
    const { assets } = this.props
    var test = document.getElementById('Table-cell-test')
    var maxWidth = 0

    // measure the largest cell in this column
    assets.forEach(asset => {
      test.innerHTML = ReactDOMServer.renderToString(<TableField {...{ asset, field, isOpen: true }}/>)
      maxWidth = Math.max(maxWidth, test.clientWidth)
    })
    // include the header!
    assets.forEach(asset => {
      test.innerHTML = unCamelCase(Asset.lastNamespace(field))
      maxWidth = Math.max(maxWidth, test.clientWidth)
    })
    test.innerHTML = '' // clean up

    // A tiny bit of padding, just to be safe
    maxWidth += 10

    // guarantee the result is sane
    maxWidth = Math.max(50, Math.min(2000, maxWidth))

    this.props.actions.setTableFieldWidth({[field]: maxWidth})
  }

  toggleArrayField = (asset, field) => {
    let assetFieldOpen = {...this.state.assetFieldOpen} // copy assetFieldOpen
    const doOpen = !(assetFieldOpen[asset.id] && assetFieldOpen[asset.id][field])
    if (doOpen) {
      if (!assetFieldOpen[asset.id]) {
        assetFieldOpen[asset.id] = {}
      }
      assetFieldOpen[asset.id][field] = true
    } else {
      delete assetFieldOpen[asset.id][field]
      if (assetFieldOpen[asset.id] && Object.keys(assetFieldOpen[asset.id]).length === 0) {
        delete assetFieldOpen[asset.id]
      }
    }
    this.assetsCounter = 0 // trigger row height recompute
    this.setState({assetFieldOpen})
  }

  isAssetFieldOpen = (asset, field) => {
    return this.state.assetFieldOpen[asset.id] && this.state.assetFieldOpen[asset.id][field]
  }

  isAssetOpen = (asset) => {
    return !!this.state.assetFieldOpen[asset.id]
  }

  recomputeRowHeights = () => {
    let { assets, fields } = this.props
    let rowHeightInLines = []
    for (let i = 0; i < assets.length; i++) {
      if (this.isAssetOpen(assets[i])) {
        rowHeightInLines[i] = Math.max.apply(Math, fields.map(field => {
          if (!this.isAssetFieldOpen(assets[i], field)) return 1
          return assets[i].rawValue(field).length + 1 // one extra for the toggle button
        }))
      } else {
        rowHeightInLines[i] = 1
      }
    }

    this.rowBottomPx.length = assets.length
    if (assets.length) this.rowBottomPx[0] = rowHeightInLines[0] * rowHeightPx
    for (let i = 1; i < assets.length; i++) {
      this.rowBottomPx[i] = this.rowBottomPx[i - 1] + rowHeightInLines[i] * rowHeightPx
    }

    // map asset ids to row number, so later we can easily track which rows
    // selected asset ids are sitting in.
    // intentionally not rolled into the above loop for logical separation & clarity
    this.assetRow = {}
    for (let i = 0; i < assets.length; i++) {
      this.assetRow[assets[i].id] = i
    }
  }

  // light wrapper around Assets.select(); just make sure we don't scroll
  // the Table when we select from the table
  select = (asset, event) => {
    this.skipNextSelectionScroll = true
    this.props.selectFn(asset, event)
  }

  scrollToSelection = () => {
    const { assets, selectedAssetIds } = this.props
    if (!assets.length) return
    if (!selectedAssetIds || selectedAssetIds.size === 0) return

    let selectedRows = []
    for (let assetId of selectedAssetIds) {
      const row = this.assetRow[assetId]
      if (row !== undefined) selectedRows.push(row)
    }
    selectedRows = selectedRows.sort()

    const firstRow = selectedRows[0]
    const lastRow = selectedRows[selectedRows.length - 1]

    const topPx = (firstRow > 0) ? this.rowBottomPx[firstRow - 1] : 0
    const bottomPx = this.rowBottomPx[lastRow]

    const selectionHeight = bottomPx - topPx

    // center the selection vertically
    let scrollPx = topPx + selectionHeight / 2 - this.state.tableScrollHeight / 2

    // if the selection doesn't fit, scroll so the first selected row is
    // at the top of the visible table area
    if (selectionHeight > this.state.tableScrollHeight) {
      scrollPx = topPx
    }

    scrollPx = Math.max(0, Math.min(this.rowBottomPx[this.rowBottomPx.length - 1], scrollPx))

    requestAnimationFrame(() => {
      if (this.refs.tableScroll) {
        this.refs.tableScroll.scrollTop = scrollPx
      }
    })
  }

  sortByField (field, event) {
    console.log('Sort by ' + field)
    const { order } = this.props
    const index = order && order.findIndex(order => (order.field === field))
    const ascending = event.metaKey && index >= 0 ? undefined
      : (!order || index < 0 ? true : !order[index].ascending)
    this.props.actions.sortAssets(field, ascending)
  }

  titleForField (field) {
    const names = field.split('.')
    if (!names || names.length < 2) return field
    let title = ''
    for (let i = names.length - 1; i >= 0; --i) {
      title = title.concat(names[i])
      if (i > 0) title = title.concat(` \u2039 `)
    }
    return title
  }

  sortOrderClassnames (field) {
    const { order } = this.props
    const index = order && order.findIndex(order => (order.field === field))
    const icon = !order || index < 0 ? 'icon-sort' : (order[index].ascending ? 'icon-sort-asc' : 'icon-sort-desc')
    return `Table-header-sort ${icon} Table-header-sort-order-${index}`
  }

  render () {
    const { assets, fields, fieldWidth, height, tableIsResizing, selectedAssetIds } = this.props
    if (!assets) return

    const { tableScrollTop, tableScrollHeight } = this.state
    const tableScrollBottom = tableScrollTop + tableScrollHeight

    if (this.props.assetsCounter !== this.assetsCounter) {
      this.recomputeRowHeights()
      this.assetsCounter = this.props.assetsCounter
    }

    requestAnimationFrame(() => {
      var tableScroll = this.refs.tableScroll
      var tableScrollHeight = tableScroll ? tableScroll.clientHeight : 0
      if (tableScrollHeight && tableScrollHeight !== this.state.tableScrollHeight) {
        this.setState({tableScrollHeight})
      }
    })

    // If the selection change triggered this update, scroll to the new selection
    if (this.props.selectionCounter !== this.selectionCounter) {
      this.selectionCounter = this.props.selectionCounter
      if (!this.skipNextSelectionScroll) {
        this.scrollToSelection()
      }
      this.skipNextSelectionScroll = false
    }

    let tableStyle = { height } //, minHeight: height, maxHeight: height }
    if (tableIsResizing) tableStyle.pointerEvents = 'none'

    return (
      <div className="Table" style={tableStyle}>
        <div className='Table-header' style={{height: `${tableHeaderHeight}px`}}>
          { fields.map((field, i) => (
            <div key={i}
                 className='Table-header-cell flexRowCenter'
                 style={{width: `${fieldWidth[field]}px`}}>
              <div className={`Table-cell`}>
                { this.titleForField(field) }
              </div>
              <i onClick={this.sortByField.bind(this, field)} className={this.sortOrderClassnames(field)}/>
              <div className='flexOn'/>
              <div className='Table-header-resizer'
                   onMouseDown={event => this.columnResizeStart(event, field)}
                   onDoubleClick={event => this.columnAutoResize(event, field)}>
                <div className='Table-header-resizer-handle'/>
              </div>
            </div>
          ))}
        </div>
        <div className='Table-scroll-clip'
             style={{
               top: `${tableHeaderHeight}px`,
               height: `${height - tableHeaderHeight}px`,
               maxHeight: `${height - tableHeaderHeight}px`
             }}>
          <div ref='tableScroll' className='Table-scroll' onScroll={this.tableScroll}>
            <div className='Table-body' style={{height: `${this.rowBottomPx[this.rowBottomPx.length - 1]}px`}}>
              { assets.map((asset, index) => {
                // Render only the visible Table rows
                if (index >= this.rowBottomPx.length) return null
                const rowTopPx = (index) ? this.rowBottomPx[index - 1] : 0
                const rowBottomPx = this.rowBottomPx[index]
                if (rowBottomPx < tableScrollTop) return null
                if (rowTopPx > tableScrollBottom) return null
                const isSelected = selectedAssetIds && selectedAssetIds.has(asset.id)
                return (
                  <div key={asset.id}
                       className={classnames('Table-row', { even: !!(index % 2), isSelected })}
                       style={{top: `${rowTopPx}px`, height: `${rowBottomPx - rowTopPx}px`}}
                       onClick={event => this.select(asset, event)}>
                    { fields.map((field, i) => (
                      <TableField {...{ asset, field, key: field, width: fieldWidth[field] }}
                        isOpen={this.isAssetFieldOpen(asset, field)}
                        onOpen={event => {
                          event.stopPropagation() // prevent row select when openening a field
                          this.toggleArrayField(asset, field)
                        }}
                      />
                    ))}
                  </div>)
              })}
              <div id='Table-cell-test' className='Table-cell'/>
            </div>
          </div>
        </div>

        <div className="Table-settings"
             style={{width: `${tableHeaderHeight}px`, height: `${tableHeaderHeight}px`}}>
          <div onClick={this.showDisplayOptions} className="icon-cog"/>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  assetsCounter: state.assets.assetsCounter,
  selectedAssetIds: state.assets.selectedIds,
  selectionCounter: state.assets.selectionCounter,
  query: state.assets.query,
  order: state.assets.order,
  fields: state.app.tableFields,
  fieldWidth: state.app.tableFieldWidth,
  user: state.auth.user,
  metadataFields: state.app.metadataFields
}), dispatch => ({
  actions: bindActionCreators({
    sortAssets,
    updateMetadataFields,
    updateTableFields,
    showModal,
    setTableFieldWidth,
    saveUserSettings
  }, dispatch)
}))(Table)
