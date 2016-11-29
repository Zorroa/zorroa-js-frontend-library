import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'

import DisplayProperties from '../../models/DisplayProperties'
import Collapsible from '../Collapsible'
import { toggleCollapsible } from '../../actions/appActions'
import { createFacetWidget } from '../../models/Widget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { unCamelCase } from '../../services/jsUtil'

class DisplayPropertiesItem extends Component {
  static propTypes = {
    // input props
    field: PropTypes.string.isRequired,
    displayProperties: PropTypes.instanceOf(DisplayProperties).isRequired,
    selectedAssets: PropTypes.object,
    isIconified: PropTypes.bool.isRequired,

    // connect props
    actions: PropTypes.object.isRequired,

    // state props
    app: PropTypes.object.isRequired
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

  toggleCollapsible = (name) => {
    const { actions, app } = this.props
    actions.toggleCollapsible(name, !app.collapsibleOpen[name])
  }

  searchTerms = (event) => {
    if (!this.isBinocularsEnabled()) return
    const { field, selectedAssets, actions } = this.props
    const facetWidget = createFacetWidget(field, selectedAssets)
    actions.modifyRacetrackWidget(facetWidget)
  }

  isBinocularsEnabled () {
    const { field, selectedAssets } = this.props
    if (!field || !field.length || !selectedAssets || !selectedAssets.size) {
      return false
    }
    return true
  }

  render () {
    const { app, field, selectedAssets, displayProperties, isIconified } = this.props
    if (displayProperties.children && displayProperties.children.length) {
      return (
        <Collapsible className='DisplayPropertiesItem'
                     style={{marginLeft: '16px'}}
                     isOpen={app.collapsibleOpen[field] || false}
                     isIconified={isIconified}
                     closeIcon="icon-register"
                     header={(<span>{displayProperties.name}</span>)}
                     onOpen={this.toggleCollapsible.bind(this, field)}
                     >
          { displayProperties.children.map(child => (
            <DisplayPropertiesItemContainer
              field={`${field}.${child.name}`}
              selectedAssets={selectedAssets}
              isIconified={isIconified}
              key={child.name}
              displayProperties={child}
            />
          ))}
        </Collapsible>
      )
    }

    return (
      <div className="DisplayPropertiesItem">
        <div className="label">
          {unCamelCase(displayProperties.name)}
        </div>
        <div onClick={this.searchTerms}
             className={classnames('search', 'icon-binoculars',
               {disabled: !this.isBinocularsEnabled()})} />
        <div className="value">
          {this.value()}
        </div>
      </div>
    )
  }
}

const DisplayPropertiesItemContainer = connect(state => ({
  app: state.app
}), dispatch => ({
  actions: bindActionCreators({ toggleCollapsible, modifyRacetrackWidget }, dispatch)
}))(DisplayPropertiesItem)

export default DisplayPropertiesItemContainer
