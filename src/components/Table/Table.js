import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import { unCamelCase } from '../../services/jsUtil'
import { updateMetadataFields, updateTableFields, showDisplayOptionsModal } from '../../actions/appActions'

class Table extends Component {
  static propTypes = {
    // app state
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    fieldWidth: PropTypes.objectOf(PropTypes.number).isRequired,
    height: PropTypes.number.isRequired,
    tableDragging: PropTypes.bool.isRequired,

    // connect actions
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      tableScrollTop: 0,
      tableScrollHeight: 0
    }
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

  render () {
    const { assets, fields, fieldWidth, height, tableDragging } = this.props
    if (!assets || !assets.length) {
      return
    }

    var fieldClass = fields.map(field => `Table-field-${field.replace('.', '_')}`)

    var mkWidthStyle = width => ({
      width: `${width}px`,
      maxWidth: `${width}px`,
      minWidth: `${width}px`
    })

    const tableHeaderHeight = 26

    return (
      <div className="Table" style={{height, minHeight: height, maxHeight: height}}>
        <div className='Table-header' style={{height: `${tableHeaderHeight}px`}}>
          { fields.map((field, i) => (
            <div className={`Table-cell ${fieldClass[field]}`}
                 style={mkWidthStyle(fieldWidth[field])}
                 key={i}>
              { unCamelCase(Asset.lastNamespace(field)) }
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
            <div className='Table-body'>
            { tableDragging ? null : assets.map(asset => (
              <div key={asset.id} className="Table-row">
                { fields.map(field => (
                  <div className={`Table-cell ${fieldClass[field]}`}
                       style={mkWidthStyle(fieldWidth[field])}
                       key={field}>
                    {asset.value(field)}
                  </div>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="Table-settings"
             style={{
               width: `${tableHeaderHeight}px`,
               height: `${tableHeaderHeight}px`
             }}>
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
  actions: bindActionCreators({ updateMetadataFields, updateTableFields, showDisplayOptionsModal }, dispatch)
}))(Table)
