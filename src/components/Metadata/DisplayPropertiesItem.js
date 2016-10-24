import React, { Component, PropTypes } from 'react'

import DisplayProperties from '../../models/DisplayProperties'
import Collapsible from '../Collapsible'
import CollapsibleHeader from '../CollapsibleHeader'

export default class DisplayPropertiesItem extends Component {
  static get propTypes () {
    return {
      field: PropTypes.string.isRequired,
      displayProperties: PropTypes.instanceOf(DisplayProperties).isRequired,
      selectedAssets: PropTypes.object
    }
  }

  value () {
    const { field, selectedAssets } = this.props
    var value = selectedAssets && selectedAssets.size ? null : '(none)'
    for (let asset of selectedAssets) {
      const v = asset.value(field)
      if (asset) {
        if (!value) {
          value = v
        } else if (value !== v) {
          value = '- Multiple Values -'
          break
        }
      }
    }
    return value
  }

  render () {
    const { field, selectedAssets, displayProperties } = this.props
    if (displayProperties.children && displayProperties.children.length) {
      return (
        <Collapsible style={{marginLeft: '16px'}}
                     header={
                       <CollapsibleHeader label={displayProperties.name}
                                          isCollapsed={false}
                                          openIcon="icon-register"
                                          closeIcon="icon-register" /> } >
          { displayProperties.children.map(child => (
            <DisplayPropertiesItem field={`${field}.${child.name}`}
                                   selectedAssets={selectedAssets}
                                   key={child.name} displayProperties={child} />
          ))}
        </Collapsible>
      )
    }

    return (
      <div style={{marginLeft: '40px'}}>
        <div style={{width: '64px'}}>
          {displayProperties.name}
        </div>
        <div style={{marginLeft: '12px'}}>
          {this.value()}
        </div>
      </div>
    )
  }
}
