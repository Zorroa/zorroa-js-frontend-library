import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import Collapsible from '../Collapsible'
import CollapsibleHeader from '../CollapsibleHeader'
import DisplayProperties from '../../models/DisplayProperties'
import DisplayPropertieItem from './DisplayPropertiesItem'

class Metadata extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    isIconified: PropTypes.bool.isRequired
  }

  renderHeader () {
    const metadataLabel = (
      <div className='flexCenter'>
        <span>Metadata</span>
        <i className='metadata-icon icon-cog'></i>
      </div>
    )
    return (<CollapsibleHeader
      label={metadataLabel}
      isIconified={this.props.isIconified}
      openIcon="icon-register" closeIcon="icon-register" />)
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
      <Collapsible style={{marginLeft: '16px'}} header={this.renderHeader()}>
        { !isIconified && fields.map(field => (<DisplayPropertieItem key={field.name} isIconified={isIconified} field={field.name} selectedAssets={selectedAssets} displayProperties={field} />)) }
      </Collapsible>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  selectedIds: state.assets.selectedIds
}))(Metadata)
