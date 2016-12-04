import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import User from '../../models/User'
import Asset from '../../models/Asset'
import { displayPropertiesForFields } from '../../models/DisplayProperties'
import DisplayPropertiesItem from './DisplayPropertiesItem'
import DisplayOptions from '../DisplayOptions'
import { updateMetadataFields, updateTableFields, showModal } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'

class Metadata extends Component {
  static propTypes = {
    // input props
    isIconified: PropTypes.bool.isRequired,

    // state props
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object
  }

  state = {
    filterString: ''
  }

  changeFilterString = (event) => {
    this.setState({ filterString: event.target.value })
  }

  showDisplayOptions = () => {
    const width = '75%'
    const body = <DisplayOptions title='Metadata Display Options'
                                 syncLabel='Table'
                                 singleSelection={false}
                                 fieldTypes={null}
                                 selectedFields={this.props.fields}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
  }

  updateDisplayOptions = (event, state) => {
    const { tableFields, user, actions } = this.props
    console.log('Update metadata display options to:\n' + JSON.stringify(state.checkedNamespaces))
    actions.updateMetadataFields(state.checkedNamespaces)
    if (state.syncedViews) {
      actions.updateTableFields(state.checkedNamespaces)
    }
    actions.saveUserSettings(user, state.checkedNamespaces,
      state.syncedValues ? state.checkedNamespaces : tableFields)
  }

  render () {
    const { assets, selectedIds, isIconified, fields } = this.props
    const { filterString } = this.state
    const lcFilterString = filterString.toLowerCase()
    const filteredFields = fields.filter(field => (field.toLowerCase().includes(lcFilterString)))
    const displayProperties = displayPropertiesForFields(filteredFields)
    var selectedAssets = new Set()
    if (selectedIds) {
      for (const id of selectedIds) {
        selectedAssets.add(assets.find(asset => (asset.id === id)))
      }
    }
    return (
      <div className="Metadata">
        <div className="header">
          <input type="text" onChange={this.changeFilterString} value={this.state.filterString} placeholder="Filter Metadata" />
          <div className="Metadata-settings" onClick={this.showDisplayOptions}>
            <i className="icon-cog"/>
          </div>
        </div>
        <div className="body">
          { displayProperties.map(field =>
            (<DisplayPropertiesItem
              key={field.name}
              isIconified={isIconified}
              field={field.name}
              selectedAssets={selectedAssets}
              displayProperties={field}
              indentLevel={0}
            />))
          }
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  selectedIds: state.assets.selectedIds,
  fields: state.app.metadataFields,
  tableFields: state.app.tableFields,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    updateMetadataFields,
    updateTableFields,
    saveUserSettings,
    showModal }, dispatch)
}))(Metadata)
