import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Asset from '../../models/Asset'
import { unCamelCase } from '../../services/jsUtil'
import {
  updateMetadataFields,
  updateTableFields,
  showDisplayOptionsModal,
  setTableFieldWidth
} from '../../actions/appActions'
import TableField from './TableField'

const rowHeightPx = 30
const tableHeaderHeight = 26

class Table extends Component {
  static propTypes = {
    // app state
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assetsKey: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    fieldWidth: PropTypes.objectOf(PropTypes.number).isRequired,
    height: PropTypes.number.isRequired,
    tableIsDragging: PropTypes.bool.isRequired,

    // connect actions
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      tableScrollTop: 0,
      tableScrollHeight: 0,
      columnDragging: false,
      assetFieldOpen: {}
    }

    this.columnDragFieldName = null
    this.columnDragStartX = 0
    this.columnDragStartWidth = 0
    this.columnDragLastSetWidth = 0
    this.allowColumnDrag = true
    this.assetsKey = ''
    this.rowBottomPx = []
  }

  showDisplayOptions = (event) => {
    const singleSelection = false
    const fieldTypes = null
    this.props.actions.showDisplayOptionsModal('Table Display Options', 'Metadata',
      this.props.fields, singleSelection, fieldTypes, this.updateDisplayOptions)
    event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    // console.log('Update table display options to:\n' + JSON.stringify(state.checkedNamespaces))
    this.props.actions.updateTableFields(state.checkedNamespaces)
    if (state.syncedViews) {
      this.props.actions.updateMetadataFields(state.checkedNamespaces)
    }
  }

  tableScroll = (event) => {
    // Horizontal scrolling for the table header,
    // keep the header in perfect sync with the table body's horiz scroll
    document.getElementsByClassName('Table-header')[0].style.left =
      `-${event.target.scrollLeft}px`

    this.setState({tableScrollTop: event.target.scrollTop, tableScrollHeight: event.target.clientHeight})
  }

  columnDragStart = (event, field) => {
    this.columnDragFieldName = field
    this.columnDragStartX = event.pageX
    this.columnDragStartWidth = this.props.fieldWidth[field]
    this.columnDragLastSetWidth = this.props.fieldWidth[field]

    var dragIcon = document.createElement('img')
    // hide the drag element using a transparent 1x1 pixel image as a proxy
    dragIcon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    dragIcon.width = 1
    event.dataTransfer.setDragImage(dragIcon, 0, 0)

    this.setState({ columnDragging: true })
  }

  columnDragUpdate = (event) => {
    if (!event.pageX) return

    // let's just completely skip events that happen while we're busy
    if (!this.allowColumnDrag) return false
    this.allowColumnDrag = false

    const dx = (event.pageX - this.columnDragStartX)
    var fieldWidth = Math.min(2000, Math.max(50, this.columnDragStartWidth + dx))

    this.columnDragLastSetWidth = fieldWidth
    this.props.actions.setTableFieldWidth({[this.columnDragFieldName]: fieldWidth})

    // wait one frame to finish the event, otherwise events queue up syncronously
    requestAnimationFrame(_ => { this.allowColumnDrag = true })
    return false
  }

  columnDragStop = (event) => {
    this.allowColumnDrag = true
    this.columnDragFieldName = null
    this.setState({ columnDragging: false })
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
    this.assetsKey = '' // trigger row height recompute
    this.setState({assetFieldOpen})
  }

  isAssetFieldOpen = (asset, field) => {
    return this.state.assetFieldOpen[asset.id] && this.state.assetFieldOpen[asset.id][field]
  }

  isAssetOpen = (asset) => {
    return !!this.state.assetFieldOpen[asset.id]
  }

  recomputeRowHeights () {
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

    this.rowBottomPx = [0]
    for (let i = 1; i < assets.length; i++) {
      this.rowBottomPx[i] = this.rowBottomPx[i - 1] + rowHeightInLines[i] * rowHeightPx
    }
  }

  render () {
    const { assets, fields, fieldWidth, height, tableIsDragging } = this.props
    if (!assets || !assets.length) return

    const { tableScrollTop, tableScrollHeight, assetsKey } = this.state
    const tableScrollBottom = tableScrollTop + tableScrollHeight

    if (assetsKey !== this.assetsKey) {
      this.recomputeRowHeights()
      this.assetsKey = assetsKey
    }

    requestAnimationFrame(() => {
      var tableScroll = document.querySelector('.Table-scroll')
      var tableScrollHeight = tableScroll ? tableScroll.clientHeight : 0
      if (tableScrollHeight && tableScrollHeight !== this.state.tableScrollHeight) {
        this.setState({tableScrollHeight})
      }
    })

    let tableStyle = { height, minHeight: height, maxHeight: height }
    if (tableIsDragging) tableStyle.pointerEvents = 'none'

    return (
      <div className="Table" style={tableStyle}>
        <div className='Table-header' style={{height: `${tableHeaderHeight}px`}}>
          { fields.map((field, i) => (
            <div key={i}
                 className='Table-header-cell flexRowCenter'
                 style={{width: `${fieldWidth[field]}px`}}>
              <div className={`Table-cell`}>
                { field.replace(/\./g, ` \u203a `) }
              </div>
              <i className='Table-header-sort icon-chevrons-expand-vertical'/>
              <div className='flexOn'/>
              <div className='Table-header-resizer'
                   draggable={true}
                   onDoubleClick={event => this.columnAutoResize(event, field)}
                   onDragStart={event => this.columnDragStart(event, field)}
                   onDrag={this.columnDragUpdate}
                   onDragEnd={this.columnDragStop}>
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
          <div className='Table-scroll' onScroll={this.tableScroll}>
            <div className='Table-body' style={{height: `${this.rowBottomPx[this.rowBottomPx.length - 1]}px`}}>
              { assets.map((asset, index) => {
                // Render only the visible Table rows
                const rowTopPx = (index) ? this.rowBottomPx[index - 1] : 0
                const rowBottomPx = this.rowBottomPx[index]
                if (rowBottomPx < tableScrollTop || rowTopPx > tableScrollBottom) return null
                return (
                  <div key={asset.id}
                       className={classnames('Table-row', { even: !!(index % 2) })}
                       style={{top: `${rowTopPx}px`, height: `${rowBottomPx - rowTopPx}px`}}>
                    { fields.map((field, i) => (
                      <TableField {...{ asset, field, key: field, width: fieldWidth[field] }}
                        isOpen={this.isAssetFieldOpen(asset, field)}
                        onOpen={event => this.toggleArrayField(asset, field)}
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
  fields: state.app.tableFields,
  fieldWidth: state.app.tableFieldWidth
}), dispatch => ({
  actions: bindActionCreators({ updateMetadataFields, updateTableFields, showDisplayOptionsModal, setTableFieldWidth }, dispatch)
}))(Table)
