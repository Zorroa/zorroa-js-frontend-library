import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import DisplayProperties from '../../models/DisplayProperties'
import DisplayPropertiesItem from './DisplayPropertiesItem'
import DisplayOptions from '../DisplayOptions'
import { updateMetadataFields, updateTableFields, displayOptions, METADATA_DISPLAY_OPTIONS, HIDE_DISPLAY_OPTIONS } from '../../actions/appActions'

class Metadata extends Component {
  static propTypes = {
    // input props
    isIconified: PropTypes.bool.isRequired,

    // state props
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    displayOptions: PropTypes.string,
    actions: PropTypes.object
  }

  updateDisplayOptions (event, state) {
    console.log('Update metadata display options to:\n' + JSON.stringify(state.checkedNamespaces))
    this.props.actions.updateMetadataFields(state.checkedNamespaces)
    if (state.syncedViews) {
      this.props.actions.updateTableFields(state.checkedNamespaces)
    }
  }

  dismissDisplayOptions () {
    this.props.actions.displayOptions(HIDE_DISPLAY_OPTIONS)
  }

  // Return existing or create a new propertry in th passed-in array
  getDisplayProperties (name, displayProperties) {
    const index = displayProperties.findIndex(d => (d.name === name))
    let dp = null
    if (index >= 0) {
      dp = displayProperties[index]
    } else {
      dp = new DisplayProperties({name})
      displayProperties.push(dp)
    }
    return dp
  }

  // Create hierarchical DisplayProperties for field rendering
  displayPropertiesForFields (fields) {
    let displayProperties = []
    for (let field of fields) {
      const namespaces = field.split('.')
      let dp = null
      for (let name of namespaces) {
        if (dp && !dp.children) {
          dp.children = []
        }
        dp = this.getDisplayProperties(name, dp ? dp.children : displayProperties)
      }
    }
    return displayProperties
  }

  render () {
    const { assets, selectedIds, isIconified, fields, displayOptions } = this.props
    const displayProperties = this.displayPropertiesForFields(fields)
    var selectedAssets = new Set()
    if (selectedIds) {
      for (const id of selectedIds) {
        selectedAssets.add(assets.find(asset => (asset.id === id)))
      }
    }
    return (
      <div className="Metadata">
        { displayOptions === METADATA_DISPLAY_OPTIONS && (
          <DisplayOptions selectedFields={fields}
                          title="Metadata Display Options"
                          syncLabel="Table"
                          onUpdate={this.updateDisplayOptions.bind(this)}
                          onDismiss={this.dismissDisplayOptions.bind(this)}/>
        )}
        { displayProperties.map(field =>
          (<DisplayPropertiesItem
            key={field.name}
            isIconified={isIconified}
            field={field.name}
            selectedAssets={selectedAssets}
            displayProperties={field}
          />))
        }
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  selectedIds: state.assets.selectedIds,
  fields: state.app.metadataFields,
  displayOptions: state.app.displayOptions
}), dispatch => ({
  actions: bindActionCreators({ updateMetadataFields, updateTableFields, displayOptions }, dispatch)
}))(Metadata)
