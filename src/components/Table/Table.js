import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import User from '../../models/User'
import { unCamelCase } from '../../services/jsUtil'
import { setTableFieldWidth, iconifyRightSidebar } from '../../actions/appActions'
import { createFacetWidget, fieldUsedInWidget } from '../../models/Widget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { sortAssets, unorderAssets, isolateAssetId } from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import TableField from './TableField'
import Resizer from '../../services/Resizer'
import { defaultMetadataFields } from '../../reducers/appReducer'

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

  constructor (props) {
    super(props)

    this.state = {
      tableScrollTop: 0,
      tableScrollLeft: 0,
      tableScrollHeight: 0,
      tableScrollWidth: 2000,
      assetFieldOpen: {}
    }

    this.columnResizeFieldName = null
    this.assetsCounter = 0
    this.rowBottomPx = []
    this.assetRow = null
    this.selectionCounter = 0
    this.skipNextSelectionScroll = false
    this.resizer = null
  }

  tableScroll = (event) => {
    // Horizontal scrolling for the table header,
    // keep the header in perfect sync with the table body's horiz scroll
    document.getElementsByClassName('Table-header')[0].style.left =
      `-${event.target.scrollLeft}px`

    this.setState({
      tableScrollTop: event.target.scrollTop,
      tableScrollLeft: event.target.scrollLeft,
      tableScrollHeight: event.target.clientHeight
    })
  }

  componentWillMount = () => { this.resizer = new Resizer() }
  componentWillUmount = () => { this.resizer.release() }

  saveTableFieldWidths () {
    const { userSettings, actions, user, fieldWidth } = this.props
    const settings = { ...userSettings, tableFieldWidths: fieldWidth }
    actions.saveUserSettings(user, settings)
  }

  columnResizeStart = (event, field) => {
    this.columnResizeFieldName = field
    this.resizer.capture(this.columnResizeUpdate, this.columnResizeStop,
      this.props.fieldWidth[field], 0)
  }

  columnResizeUpdate = (resizeX, resizeY) => {
    var fieldWidth = Math.min(2000, Math.max(50, resizeX))
    this.props.actions.setTableFieldWidth({[this.columnResizeFieldName]: fieldWidth})
  }

  columnResizeStop = (event) => {
    this.columnResizeFieldName = null
    this.saveTableFieldWidths()
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
    this.saveTableFieldWidths()
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
    if (!fields || !fields.length) fields = defaultMetadataFields
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

  isolateToLightbox (asset) {
    this.props.actions.isolateAssetId(asset.id)
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

  // Rotate through on -> off -> unordered
  sortByField (field) {
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
    field = field && field.endsWith('.raw') ? field : field + '.raw'
    const index = this.props.widgets.findIndex(widget => fieldUsedInWidget(field, widget))
    let terms = [term]
    if (index >= 0 && event.shiftKey) {       // Add to terms for shift
      const widget = this.props.widgets[index]
      if (widget.sliver && widget.sliver.filter && widget.sliver.filter.terms) {
        terms = [...widget.sliver.filter.terms[field], term]
      }
    }
    const widget = createFacetWidget(field, terms, this.props.fieldTypes)
    if (index >= 0) widget.id = this.props.widgets[index].id
    this.props.actions.modifyRacetrackWidget(widget)
    this.props.actions.iconifyRightSidebar(false)
    event.stopPropagation()
  }

  renderTitle (field, fields) {
    const types = ['point', 'bit', 'byte', 'raw']
    const names = field.split('.')
    if (!names || names.length < 2) return field
    let title = ''
    let head, tail
    for (let i = names.length - 1; i >= 0; --i) {
      if (i === names.length - 1 && types.findIndex(t => t === names[i]) >= 0) continue
      if (!head) {
        head = names[i]
      } else if (!tail) {
        tail = ` \u2039 ${names[i]}`
      } else {
        tail = tail.concat(` \u2039 ${names[i]}`)
      }
      title = title.concat(names[i])
      const matchesAnotherField = fields.findIndex(f => f !== field && f.endsWith(title)) >= 0
      if (!matchesAnotherField) break
      if (i > 0) title = title.concat('.')
    }
    return (
      <div className="Table-title">
        <div className="Table-title-head">{unCamelCase(head)}</div>
        { tail && <div className="Table-title-tail">&nbsp;{tail}</div> }
      </div>
    )
  }

  sortOrderClassnames (field) {
    const { order } = this.props
    const index = order && order.findIndex(order => (order.field === field))
    const icon = !order || index !== 0 ? 'icon-sort' : (order[index].ascending ? 'icon-sort-asc' : 'icon-sort-desc')
    return `Table-header-sort ${icon} Table-header-sort-order-${index}`
  }

  headerClassnames (field) {
    const { order } = this.props
    const index = order && order.findIndex(order => (order.field === field))
    const ordered = !(!order || index !== 0)
    return classnames('Table-header-cell', {ordered})
  }

  render () {
    const { assets, fieldWidth, height, tableIsResizing, selectedAssetIds } = this.props
    if (!assets) return

    const fields = this.props.fields && this.props.fields.length ? this.props.fields : defaultMetadataFields
    const { tableScrollTop, tableScrollHeight } = this.state
    const tableScrollBottom = tableScrollTop + tableScrollHeight

    if (this.props.assetsCounter !== this.assetsCounter) {
      this.recomputeRowHeights()
      this.assetsCounter = this.props.assetsCounter
    }

    requestAnimationFrame(() => {
      var tableScroll = this.refs.tableScroll
      var tableScrollHeight = tableScroll ? tableScroll.clientHeight : 0
      var tableScrollWidth = tableScroll ? tableScroll.clientWidth : 2000
      if (tableScrollHeight && tableScrollHeight !== this.state.tableScrollHeight) {
        this.setState({tableScrollHeight})
      }
      if (tableScrollWidth && tableScrollWidth !== this.state.tableScrollWidth) {
        this.setState({tableScrollWidth})
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

    // pre-compute which columns are visible
    let sumOfFieldWidths = 0
    let firstVisibleFieldIndex = -1
    let lastVisibleFieldIndex = -1
    let fieldLeft = []
    let visibleFields = []
    for (let i = 0; i < fields.length; i++) {
      fieldLeft.push(sumOfFieldWidths)
      const field = fields[i]
      const width = fieldWidth[field]
      // Is right side of field left of the table's left edge?
      if (sumOfFieldWidths + width < this.state.tableScrollLeft) {
        firstVisibleFieldIndex = i + 1
      }
      // Is left side of field right of the table's right edge?
      if (sumOfFieldWidths < this.state.tableScrollLeft + this.state.tableScrollWidth) {
        lastVisibleFieldIndex = i
      }
      sumOfFieldWidths += width
      let fieldIsVisible = false
      if (i === 0) fieldIsVisible = true
      if (i === fields.length - 1) fieldIsVisible = true
      if (i >= firstVisibleFieldIndex && i <= lastVisibleFieldIndex) fieldIsVisible = true
      if (fieldIsVisible) visibleFields.push(i)
    }

    return (
      <div className="Table" style={tableStyle}>
        <div className='Table-header' style={{height: `${tableHeaderHeight}px`, width: `${sumOfFieldWidths}px`}}>
          { visibleFields.map((fieldIndex) => {
            const field = fields[fieldIndex]
            return (
              <div key={fieldIndex}
                   className={this.headerClassnames(field)}
                   style={{width: `${fieldWidth[field]}px`, left: `${fieldLeft[fieldIndex]}px`, top: '0px', position: 'absolute'}}>
                <div className={`Table-cell`}>
                  { this.renderTitle(field, fields) }
                </div>
                <i onClick={this.sortByField.bind(this, field)} className={this.sortOrderClassnames(field)}/>
                <div className='flexOn'/>
                <div className='Table-header-resizer'
                     onMouseDown={event => this.columnResizeStart(event, field)}
                     onDoubleClick={event => this.columnAutoResize(event, field)}>
                  <div className='Table-header-resizer-handle'/>
                </div>
              </div>
            )
          }) }
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
                       style={{top: `${rowTopPx}px`, height: `${rowBottomPx - rowTopPx}px`, width: `${sumOfFieldWidths}px`}}
                       onClick={event => this.select(asset, event)}
                       onDoubleClick={event => this.isolateToLightbox(asset)}>
                    { visibleFields.map((fieldIndex) => {
                      const field = fields[fieldIndex]
                      const width = fieldWidth[field]
                      return (
                        <TableField {...{ asset, field, key: field, width, left: `${fieldLeft[fieldIndex]}px`, top: `0px` }}
                          onTag={this.createTagFacet}
                          isOpen={this.isAssetFieldOpen(asset, field)}
                          onOpen={event => {
                            event.stopPropagation() // prevent row select when openening a field
                            this.toggleArrayField(asset, field)
                          }}
                        />
                      )
                    })}
                  </div>)
              })}
              <div id='Table-cell-test' className='Table-cell'/>
            </div>
          </div>
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
}))(Table)
