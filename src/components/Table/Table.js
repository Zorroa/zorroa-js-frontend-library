import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import { disableSort } from '../../services/disableSort'

import Resizer from '../../services/Resizer'

export default class Table extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ).isRequired,
    assetsCounter: PropTypes.number.isRequired,
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectionCounter: PropTypes.number.isRequired,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        title: PropTypes.element.isRequired,
        order: PropTypes.string,
        width: PropTypes.number.isRequired,
      }),
    ).isRequired,
    look: PropTypes.oneOf(['compact', 'clean']),
    isSingleSelectOnly: PropTypes.bool,
    keyColor: PropTypes.string.isRequired,
    whiteLabelEnabled: PropTypes.bool.isRequired,

    // input props
    height: PropTypes.number.isRequired,
    tableIsResizing: PropTypes.bool.isRequired,
    onSettings: PropTypes.func,
    onColumnHeaderContextMenu: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.element),

    // Callbacks
    selectFn: PropTypes.func.isRequired,
    isolateFn: PropTypes.func,
    autoResizeFieldFn: PropTypes.func,
    setFieldWidthFn: PropTypes.func,
    sortFieldFn: PropTypes.func,
    elementFn: PropTypes.func.isRequired,
    noScroll: PropTypes.bool,
  }

  constructor(props) {
    super(props)

    this.state = {
      tableScrollTop: 0,
      tableScrollLeft: 0,
      tableScrollHeight: 0,
      tableScrollWidth: 2000,
      assetFieldOpen: {},
    }

    this.columnResizeFieldName = null
    this.assetsCounter = 0
    this.assetRow = null
    this.selectionCounter = 0
    this.skipNextSelectionScroll = false
    this.resizer = null
  }

  getRowHeight() {
    if (this.props.look === 'clean') {
      return 40
    }

    return 30
  }

  getTableHeaderHeight() {
    if (this.props.look === 'clean') {
      return 40
    }

    return 26
  }

  onColumnHeaderContextMenu = (fieldIndex, event) => {
    const onColumnHeaderContextMenu = this.props.onColumnHeaderContextMenu

    if (typeof this.props.onColumnHeaderContextMenu === 'function') {
      onColumnHeaderContextMenu(fieldIndex, event)
    }
  }

  tableScroll = event => {
    // Horizontal scrolling for the table header,
    // keep the header in perfect sync with the table body's horiz scroll
    document.getElementsByClassName('Table-header')[0].style.left = `-${
      event.target.scrollLeft
    }px`

    this.setState({
      tableScrollTop: event.target.scrollTop,
      tableScrollLeft: event.target.scrollLeft,
      tableScrollHeight: event.target.clientHeight,
    })
  }

  componentWillMount = () => {
    this.resizer = new Resizer()
  }
  componentWillUmount = () => {
    this.resizer.release()
  }

  columnResizeStart = (event, field) => {
    this.columnResizeFieldName = field
    const index = this.props.fields.findIndex(f => f.field === field)
    const width = (index >= 0 && this.props.fields[index].width) || 100
    this.resizer.capture(
      this.columnResizeUpdate,
      this.columnResizeStop,
      width,
      0,
    )
  }

  columnResizeUpdate = resizeX => {
    var fieldWidth = Math.min(2000, Math.max(50, resizeX))
    if (this.canResizeFieldWidth()) {
      this.props.setFieldWidthFn(this.columnResizeFieldName, fieldWidth)
    }
  }

  columnResizeStop = event => {
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
      maxWidth = (index >= 0 && this.props.fields[index].width) || 100
    }

    // A tiny bit of padding, just to be safe
    maxWidth += 10

    // guarantee the result is sane
    maxWidth = Math.max(50, Math.min(2000, maxWidth))

    if (this.canResizeFieldWidth()) {
      this.props.setFieldWidthFn(field, maxWidth)
    }
  }

  rowBottomPx = row => Math.max(0, row + 1) * this.getRowHeight()

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
    let scrollPx =
      topPx + selectionHeight / 2 - this.state.tableScrollHeight / 2

    // if the selection doesn't fit, scroll so the first selected row is
    // at the top of the visible table area
    if (selectionHeight > this.state.tableScrollHeight) {
      scrollPx = topPx
    }

    scrollPx = Math.max(
      0,
      Math.min(this.rowBottomPx(assets.length - 1), scrollPx),
    )

    requestAnimationFrame(() => {
      if (this.refs.tableScroll) {
        this.refs.tableScroll.scrollTop = scrollPx
      }
    })
  }

  sortOrderClassnames(order, field) {
    const icon = !order
      ? 'icon-sort'
      : order === 'ascending' ? 'icon-sort-asc' : 'icon-sort-desc'
    const sort = disableSort(field) ? 'disableSort' : ''
    return `Table-header-sort ${icon} Table-header-sort-order-${order ||
      'none'} ${sort}`
  }

  headerClassnames(order) {
    const ordered = !!order
    return classnames('Table-header-cell', { ordered })
  }

  canResizeFieldWidth() {
    return typeof this.props.setFieldWidthFn === 'function'
  }

  render() {
    const {
      assets,
      fields,
      height,
      tableIsResizing,
      selectedAssetIds,
      onSettings,
      children,
      isSingleSelectOnly,
    } = this.props
    const tableHeaderHeight = this.getTableHeaderHeight()
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
      if (
        tableScrollHeight &&
        tableScrollHeight !== this.state.tableScrollHeight
      ) {
        this.setState({ tableScrollHeight })
      }
      if (
        tableScrollWidth &&
        tableScrollWidth !== this.state.tableScrollWidth
      ) {
        this.setState({ tableScrollWidth })
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
      if (
        sumOfFieldWidths <
        this.state.tableScrollLeft + this.state.tableScrollWidth
      ) {
        lastVisibleFieldIndex = i
      }
      sumOfFieldWidths += width
      let fieldIsVisible = false
      if (i === 0) fieldIsVisible = true
      if (i === fields.length - 1) fieldIsVisible = true
      if (i >= firstVisibleFieldIndex && i <= lastVisibleFieldIndex)
        fieldIsVisible = true
      if (fieldIsVisible) visibleFields.push(i)
    }
    const tableClassNames = classnames('Table', {
      'Table--no-scroll': this.props.noScroll === true,
    })

    return (
      <div className={tableClassNames} style={tableStyle}>
        <div
          className="Table-header"
          style={{
            height: `${tableHeaderHeight}px`,
            width: `${sumOfFieldWidths}px`,
          }}>
          {visibleFields.map(fieldIndex => {
            const { field, title, order, width } = fields[fieldIndex]
            return (
              <div
                key={fieldIndex}
                onContextMenu={e =>
                  this.onColumnHeaderContextMenu(fieldIndex, e)
                }
                className={this.headerClassnames(order)}
                style={{
                  width: `${width}px`,
                  left: `${fieldLeft[fieldIndex]}px`,
                  top: '0px',
                  position: 'absolute',
                }}>
                <div className="Table-cell">{title}</div>
                <div className="flexOn" />
                {this.props.sortFieldFn && (
                  <i
                    onClick={_ => this.props.sortFieldFn(field)}
                    className={classnames(
                      this.sortOrderClassnames(order, field),
                    )}
                  />
                )}
                <div
                  className="Table-header-resizer"
                  onMouseDown={event => this.columnResizeStart(event, field)}
                  onDoubleClick={event => this.columnAutoResize(event, field)}>
                  {this.canResizeFieldWidth() && (
                    <div className="Table-header-resizer-handle" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div
          className="Table-scroll-clip"
          style={{
            top: `${tableHeaderHeight}px`,
            height: `${height - tableHeaderHeight}px`,
            maxHeight: `${height - tableHeaderHeight}px`,
          }}>
          <div
            ref="tableScroll"
            className="Table-scroll"
            onScroll={this.tableScroll}>
            <div
              className="Table-body"
              style={{ height: `${this.rowBottomPx(assets.length - 1)}px` }}>
              {assets.map((asset, index) => {
                // Render only the visible Table rows
                if (index >= assets.length) return null
                const rowTopPx = this.rowBottomPx(index - 1)
                const rowBottomPx = this.rowBottomPx(index)
                if (rowBottomPx < tableScrollTop) return null
                if (rowTopPx > tableScrollBottom) return null
                const isSelected =
                  selectedAssetIds && selectedAssetIds.has(asset.id)
                return (
                  <div
                    key={asset.id}
                    className={classnames('Table-row', {
                      even: !!(index % 2),
                      isSelected,
                      isSingleSelectOnly: isSingleSelectOnly === true,
                    })}
                    style={{
                      top: `${rowTopPx}px`,
                      height: `${rowBottomPx - rowTopPx}px`,
                      width: `${sumOfFieldWidths}px`,
                    }}
                    onClick={event => this.select(asset, event)}
                    onDoubleClick={event => this.isolate(asset, event)}>
                    {visibleFields.map(fieldIndex => {
                      const { field, width, order } = fields[fieldIndex]
                      return this.props.elementFn(
                        asset,
                        field,
                        width,
                        fieldLeft[fieldIndex],
                        order,
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {onSettings && (
          <div
            className={classnames('Table-settings', {
              'Table-settings--white-label': this.props.whiteLabelEnabled,
            })}
            style={{
              backgroundColor:
                this.props.whiteLabelEnabled && this.props.keyColor,
            }}
            onClick={onSettings}>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
              <path
                fill="#FFF"
                fillRule="evenodd"
                d="M4 4V0h2v4h4v2H6v4H4V6H0V4h4z"
              />
            </svg>
          </div>
        )}
        {children}
      </div>
    )
  }
}
