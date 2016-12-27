import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import { displayPropertiesForFields } from '../../models/DisplayProperties'
import DisplayPropertiesItem from './DisplayPropertiesItem'
import DisplayOptions from '../DisplayOptions'
import { updateMetadataFields, updateTableFields, showModal } from '../../actions/appActions'

class Metadata extends Component {
  static propTypes = {
    // input props
    isIconified: PropTypes.bool.isRequired,

    // state props
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    console.log('Update metadata display options to:\n' + JSON.stringify(state.checkedNamespaces))
    this.props.actions.updateMetadataFields(state.checkedNamespaces)
    if (state.syncedViews) {
      this.props.actions.updateTableFields(state.checkedNamespaces)
    }
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
  fields: state.app.metadataFields
}), dispatch => ({
  actions: bindActionCreators({ updateMetadataFields, updateTableFields, showModal }, dispatch)
}))(Metadata)
