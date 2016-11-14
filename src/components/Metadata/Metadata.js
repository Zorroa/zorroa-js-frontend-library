import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import DisplayProperties from '../../models/DisplayProperties'
import DisplayPropertiesItem from './DisplayPropertiesItem'

class Metadata extends Component {
  static propTypes = {
    // input props
    isIconified: PropTypes.bool.isRequired,

    // state props
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object
  }

  render () {
    const json = [
      {
        name: 'source',
        children: [{name: 'filename'}]
      },
      {
        name: 'proxies',
        children: [
          { name: 'tinyProxy' },
          { name: 'proxies',
            children: [
              { name: 'width' }, { name: 'height' }, { name: 'id' }
            ]
          }
        ]
      }
    ]

    const fields = json.map(item => (new DisplayProperties(item)))
    const { assets, selectedIds, isIconified } = this.props
    var selectedAssets = new Set()
    if (selectedIds) {
      for (const id of selectedIds) {
        selectedAssets.add(assets.find(asset => (asset.id === id)))
      }
    }
    console.log('Selected assets: ' + selectedAssets.size + ' ' + JSON.stringify(selectedAssets))
    return (
      <div className='Metadata'>
        { fields.map(field =>
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
  selectedIds: state.assets.selectedIds
}))(Metadata)
