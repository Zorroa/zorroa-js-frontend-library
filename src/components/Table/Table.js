import React, { Component, PropTypes } from 'react'
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

class Table extends Component {
  static propTypes = {
    // app state
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
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
      columnDragging: false
    }

    this.columnDragFieldName = null
    this.columnDragStartX = 0
    this.columnDragStartWidth = 0
    this.columnDragLastSetWidth = 0
    this.allowColumnDrag = true
  }

  showDisplayOptions = (event) => {
    const singleSelection = false
    const fieldTypes = null
    this.props.actions.showDisplayOptionsModal('Table Display Options', 'Metadata',
      this.props.fields, singleSelection, fieldTypes, this.updateDisplayOptions)
    event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    console.log('Update table display options to:\n' + JSON.stringify(state.checkedNamespaces))
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
      test.innerHTML = asset.value(field)
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

  renderColorArrayFieldValue = () => {
  }

  renderStringArrayFieldValue = (vals) => {
    return (
      <div className='Table-cell-array'>
        { vals.map(val => (<div className='Table-cell-array-string'>{val}</div>)) }
      </div>
    )
  }

  renderFieldValue = (val) => {
    return (Asset._valueToString(val))
  }

  renderField = (field, asset) => {
    const { fieldWidth } = this.props
    const val = asset.rawValue(field)
    let renderValFn = this.renderFieldValue

    if (Array.isArray(val)) {
      renderValFn = this.renderStringArrayFieldValue
    }

    return (
      <div className={`Table-cell`}
           style={{width: `${fieldWidth[field]}px`}}
           key={field}>
        { renderValFn(val) }
      </div>
    )
  }

  render () {
    const { assets, fields, fieldWidth, height, tableIsDragging } = this.props
    if (!assets || !assets.length) return

    const tableHeaderHeight = 26
    const rowHeight = 30
    const { tableScrollTop, tableScrollHeight } = this.state
    const tableScrollBottom = tableScrollTop + tableScrollHeight

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
            <div className='Table-body' style={{height: `${assets.length * rowHeight}px`}}>
              { assets.map((asset, index) => {
                const rowTop = index * rowHeight
                const rowBottom = rowTop + rowHeight
                if (rowBottom < tableScrollTop) return null
                if (rowTop > tableScrollBottom) return null
                return (
                  <div key={asset.id}
                       className={classnames('Table-row', { even: !!(index % 2) })}
                       style={{top: `${rowTop}px`}}>
                    { fields.map((field, i) => this.renderField(field, asset)) }
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
