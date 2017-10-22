import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Resizer from '../../services/Resizer'

const rowHeightPx = 30
const tableHeaderHeight = 26

export default class Table extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })).isRequired,
    assetsCounter: PropTypes.number.isRequired,
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectionCounter: PropTypes.number.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
      field: PropTypes.string.isRequired,
      title: PropTypes.element.isRequired,
      order: PropTypes.string,
      width: PropTypes.number.isRequired
    })).isRequired,

    // input props
    height: PropTypes.number.isRequired,
    tableIsResizing: PropTypes.bool.isRequired,

    // Callbacks
    selectFn: PropTypes.func.isRequired,
    isolateFn: PropTypes.func,
    autoResizeFieldFn: PropTypes.func,
    setFieldWidthFn: PropTypes.func,
    sortFieldFn: PropTypes.func,
    elementFn: PropTypes.func.isRequired
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

  columnResizeStart = (event, field) => {
    this.columnResizeFieldName = field
    const index = this.props.fields.findIndex(f => f.field === field)
    const width = index >= 0 && this.props.fields[index].width || 100
    this.resizer.capture(this.columnResizeUpdate, this.columnResizeStop, width, 0)
  }

  columnResizeUpdate = (resizeX, resizeY) => {
    var fieldWidth = Math.min(2000, Math.max(50, resizeX))
    this.props.setFieldWidthFn(this.columnResizeFieldName, fieldWidth)
  }

  columnResizeStop = (event) => {
    this.columnResizeFieldName = null
  }

  columnAutoResize = (event, field) => {
    const { assets, autoResizeFieldFn } = this.props
    let maxWidth = 0

    // measure the largest cell in this column
    if (autoResizeFieldFn) {
      assets.forEach(asset => {
        const width = autoResizeFieldFn(field, asset)
        maxWidth = Math.max(maxWidth, width)
      })
    } else {
      // Get the current width of this column
      const index = this.props.fields.findIndex(f => f.field === field)
      maxWidth = index >= 0 && this.props.fields[index].width || 100
    }

    // A tiny bit of padding, just to be safe
    maxWidth += 10

    // guarantee the result is sane
    maxWidth = Math.max(50, Math.min(2000, maxWidth))
    this.props.setFieldWidthFn(field, maxWidth)
  }

  rowBottomPx = (row) => (Math.max(0, row + 1) * rowHeightPx)

  recomputeRowHeights = () => {
    let { assets } = this.props

    // map asset ids to row number, so later we can easily track which rows
    // selected asset ids are sitting in.
    // intentionally not rolled into the above loop for logical separation & clarity
    this.assetRow = {}
    for (let i = 0; i < assets.length; i++) {
      this.assetRow[assets[i].id] = i
    }
  }

  isolate = (asset, event) => {
    const { isolateFn } = this.props
    if (isolateFn) isolateFn(asset, event)
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

    const topPx = this.rowBottomPx(firstRow - 1)
    const bottomPx = this.rowBottomPx(lastRow)

    const selectionHeight = bottomPx - topPx

    // center the selection vertically
    let scrollPx = topPx + selectionHeight / 2 - this.state.tableScrollHeight / 2

    // if the selection doesn't fit, scroll so the first selected row is
    // at the top of the visible table area
    if (selectionHeight > this.state.tableScrollHeight) {
      scrollPx = topPx
    }

    scrollPx = Math.max(0, Math.min(this.rowBottomPx(assets.length - 1), scrollPx))

    requestAnimationFrame(() => {
      if (this.refs.tableScroll) {
        this.refs.tableScroll.scrollTop = scrollPx
      }
    })
  }

  sortOrderClassnames (order) {
    const icon = !order ? 'icon-sort' : (order === 'ascending' ? 'icon-sort-asc' : 'icon-sort-desc')
    return `Table-header-sort ${icon} Table-header-sort-order-${order || 'none'}`
  }

  headerClassnames (order) {
    const ordered = !!order
    return classnames('Table-header-cell', {ordered})
  }

  render () {
    const { assets, fields, height, tableIsResizing, selectedAssetIds } = this.props
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
      const width = fields[i].width
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
            const { field, title, order, width } = fields[fieldIndex]
            return (
              <div key={fieldIndex}
                   className={this.headerClassnames(order)}
                   style={{width: `${width}px`, left: `${fieldLeft[fieldIndex]}px`, top: '0px', position: 'absolute'}}>
                <div className={`Table-cell`}>
                  { title }
                </div>
                { this.props.sortFieldFn && <i onClick={_ => this.props.sortFieldFn(field)} className={this.sortOrderClassnames(order)}/> }
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
            <div className='Table-body' style={{height: `${this.rowBottomPx(assets.length - 1)}px`}}>
              { assets.map((asset, index) => {
                // Render only the visible Table rows
                if (index >= assets.length) return null
                const rowTopPx = this.rowBottomPx(index - 1)
                const rowBottomPx = this.rowBottomPx(index)
                if (rowBottomPx < tableScrollTop) return null
                if (rowTopPx > tableScrollBottom) return null
                const isSelected = selectedAssetIds && selectedAssetIds.has(asset.id)
                return (
                  <div key={asset.id}
                       className={classnames('Table-row', { even: !!(index % 2), isSelected })}
                       style={{top: `${rowTopPx}px`, height: `${rowBottomPx - rowTopPx}px`, width: `${sumOfFieldWidths}px`}}
                       onClick={event => this.select(asset, event)}
                       onDoubleClick={event => this.isolate(asset, event)}>
                    { visibleFields.map((fieldIndex) => {
                      const { field, width } = fields[fieldIndex]
                      return this.props.elementFn(asset, field, width, fieldLeft[fieldIndex])
                    })}
                  </div>)
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
