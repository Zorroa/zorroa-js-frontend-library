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

    // connect actions
    actions: PropTypes.object
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

  syncScroll = (event) => {
    // Horizontal scrolling for the table header,
    // keep the header in perfect sync with the table body's horiz scroll
    document.getElementsByClassName('Table-header')[0].style.left =
      `-${event.target.scrollLeft}px`
  }

  render () {
    const { assets, fields, fieldWidth } = this.props
    if (!assets || !assets.length) {
      return
    }

    var fieldClass = fields.map(field => `Table-field-${field.replace('.', '_')}`)

    var mkWidthStyle = width => ({
      width: `${width}px`,
      maxWidth: `${width}px`,
      minWidth: `${width}px`
    })

    return (
      <div className="Table">
        <div className='Table-header'>
          { fields.map((field, i) => (
            <div className={`Table-cell ${fieldClass[field]}`}
                 style={mkWidthStyle(fieldWidth[field])}
                 key={i}>
              { unCamelCase(Asset.lastNamespace(field)) }
            </div>
          ))}
        </div>
        <div className='Table-scroll-clip'>
          <div className='Table-scroll' onScroll={this.syncScroll}>
            <div className='Table-body'>
            { assets.map(asset => (
              <div key={asset.id} className="Table-row">
                { fields.map(field => (
                  <div className={`Table-cell ${fieldClass[field]}`}
                       style={mkWidthStyle(fieldWidth[field])}
                       key={field}>
                    {asset.value(field)}
                  </div>
                ))}
              </div>)) }
            </div>
          </div>
        </div>

        <div className="Table-settings">
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
