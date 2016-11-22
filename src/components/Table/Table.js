import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import { unCamelCase } from '../../services/jsUtil'
import { updateMetadataFields, updateTableFields, showDisplayOptionsModal } from '../../actions/appActions'

class Table extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
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

  renderRow (asset) {
    const { fields } = this.props
    return (
      <tr key={asset.id} className="Table-row">
        { fields.map(field => (
          <td key={field} className="Table-value">{asset.value(field)}</td>
        ))}
        <td><div key={'cog'}/></td>
      </tr>
    )
  }

  render () {
    const { assets, fields } = this.props
    if (!assets || !assets.length) {
      return
    }
    return (
      <div className="Table flexOff">
        <table className="Table-table">
          <thead>
          <tr>
            { fields.map((field, i) => (
              <th key={i} className="Table-header">
                { unCamelCase(Asset.lastNamespace(field)) }
              </th>
            ))}
            <th key={'cog'} className="Table-settings">
              <div onClick={this.showDisplayOptions} className="icon-cog"/>
            </th>
          </tr>
          </thead>
          <tbody>
          { assets.map(asset => (this.renderRow(asset))) }
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  fields: state.app.tableFields
}), dispatch => ({
  actions: bindActionCreators({ updateMetadataFields, updateTableFields, showDisplayOptionsModal }, dispatch)
}))(Table)
