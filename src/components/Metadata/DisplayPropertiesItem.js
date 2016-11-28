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
    let allTerms = []
    let someTerms = []
    let value = selectedAssets && selectedAssets.size ? null : '(none)'
    for (let asset of selectedAssets) {
      if (!asset) continue

      // Special handling for string arrays, displayed as keyword tags
      let terms = asset.terms(field)
      if (Array.isArray(terms) && terms.length && (typeof terms[0] === 'string' || terms[0] instanceof String)) {
        if (!allTerms.length) {
          allTerms = terms
        } else {
          // Split up the terms between the "in-all" and "in-some" sets
          let a = new Set()
          let s = new Set()
          allTerms.forEach(t => {
            if (terms.indexOf(t) < 0) {
              s.add(t)
            } else {
              a.add(t)
            }
          })
          terms.forEach(t => {
            if (allTerms.indexOf(t) < 0) {
              s.add(t)
            } else {
              a.add(t)
            }
          })
          allTerms = [...a]
          someTerms = [...s]
        }
      }

      // Check for identical values in multiple selection
      const v = asset.value(field)
      if (!value) {
        value = v
      } else if (value !== v) {
        value = '- Multiple Values -'
        break
      }
    }

    // String arrays take precedence
    if (allTerms.length || someTerms.length) {
      return (
        <div className="terms flexRow flexWrap">
          { allTerms.map(t => (<div className="all">{t}</div>)) }
          { someTerms.map(t => (<div className="some">{t}</div>))}
        </div>
      )
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
