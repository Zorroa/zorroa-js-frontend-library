import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import DisplayOptions from '../DisplayOptions'
import { unCamelCase } from '../../services/jsUtil'
import { updateMetadataFields, updateTableFields } from '../../actions/appActions'

class Table extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    actions: PropTypes.object
  }

  state = { showDisplayOptions: false }

  editDisplayOptions (event) {
    this.setState({ showDisplayOptions: true })
    event.stopPropagation()
  }

  updateDisplayOptions (event, state) {
    console.log('Update table display options to:\n' + JSON.stringify(state.checkedNamespaces))
    this.props.actions.updateTableFields(state.checkedNamespaces)
    if (state.syncedViews) {
      this.props.actions.updateMetadataFields(state.checkedNamespaces)
    }
  }

  dismissDisplayOptions () {
    this.setState({ showDisplayOptions: false })
  }

  renderRow (asset) {
    const { fields } = this.props
    return (
      <tr key={asset.id} className="assets-table-row">
        { fields.map(field => (
          <td key={field} className="assets-table-value">{asset.value(field)}</td>
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
      <div className="assets-table-scroll">
        { this.state.showDisplayOptions && (
          <DisplayOptions selectedFields={fields}
                          title="Table Display Options"
                          syncLabel="Metadata"
                          onUpdate={this.updateDisplayOptions.bind(this)}
                          onDismiss={this.dismissDisplayOptions.bind(this)}/>
        )}
        <table className="assets-table">
          <thead>
          <tr>
            { fields.map((field, i) => (
              <th key={i} className="assets-table-header">
                { unCamelCase(Asset.lastNamespace(field)) }
              </th>
            ))}
            <th key={'cog'} className="asset-table-settings"><div onClick={this.editDisplayOptions.bind(this)} className="icon-cog"/></th>
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
  actions: bindActionCreators({ updateMetadataFields, updateTableFields }, dispatch)
}))(Table)
