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
    arrayIndex: PropTypes.number,
    indentLevel: PropTypes.number.isRequired,

    // connect props
    actions: PropTypes.object.isRequired,

    // state props
    app: PropTypes.object.isRequired
  }

  arrayValue(val, key, className) {
    if (val[0] && val[0][0] === '#' && (val.length === 7 || val.length === 4)) {
      return <div className="DisplayPropertiesItem-color" key={key} style={{backgroundColor: val}}/>
    }
    return <div key={key} className={className}>{val}</div>
  }

  value () {
    const { field, selectedAssets } = this.props
    let allTerms = []
    let someTerms = []
    let value = null
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
      if (v !== undefined) {
        if (value === null) {
          value = v
        } else if (value !== v) {
          value = '- Multiple Values -'
          break
        }
      }
    }

    // String arrays take precedence
    if (allTerms.length || someTerms.length) {
      return (
        <div className="terms flexRow flexWrap">
          { allTerms.map((t, i) => this.arrayValue(t, i, 'DisplayPropertiesItem-all-values')) }
          { someTerms.map((t, i) => this.arrayValue(t, i, 'DisplayPropertiesItem-some-values')) }
        </div>
      )
    }
    return value
  }

  rawValue () {
    const { field, selectedAssets } = this.props
    let value = selectedAssets && selectedAssets.size ? null : '(none)'
    for (let asset of selectedAssets) {
      if (!asset) continue
      // Check for identical values in multiple selection
      const v = asset.rawValue(field)
      if (!value) {
        value = v
      } else if (JSON.stringify(value) !== JSON.stringify(v)) {
        return '- Multiple Values -'
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

  renderItemContainer (isArray, rawValue, indentLevel) {
    const { field, selectedAssets, isIconified, displayProperties } = this.props
    return (
      (isArray ? rawValue : displayProperties.children).map((child, i) => (
        <DisplayPropertiesItemContainer
          field={`${field}.${isArray ? i : child.name}`}
          selectedAssets={selectedAssets}
          isIconified={isIconified}
          key={i}
          arrayIndex={isArray ? i : undefined}
          displayProperties={isArray ? displayProperties : child}
          indentLevel={indentLevel}
        />
      ))
    )
  }

  render () {
    const { app, field, displayProperties, isIconified, arrayIndex, indentLevel } = this.props
    const rawValue = this.rawValue()
    const isArray = Array.isArray(rawValue)
    const indent = { marginLeft: `${indentLevel * 14}px` }
    if (displayProperties.children && displayProperties.children.length) {
      if (isArray) return (
        <div className="DisplayPropertiesItem-array">
          { this.renderItemContainer(isArray, rawValue, indentLevel)}
        </div>
      )
      return (
        <Collapsible className='DisplayPropertiesItem'
                     style={{marginLeft: '16px'}}
                     isOpen={app.collapsibleOpen[field] || false}
                     isIconified={isIconified}
                     header={(
                       <div style={indent} className="DisplayPropertiesItem-header">
                         <div key={-1} className="DisplayPropertiesItem-header-label">
                           {displayProperties.name + (arrayIndex !== undefined ? `[${arrayIndex}]` : '')}
                         </div>
                       </div>
                     )}
                     onOpen={this.toggleCollapsible.bind(this, field)}
                     >
          { this.renderItemContainer(isArray, rawValue, indentLevel + 1) }
        </Collapsible>
      )
    }

    return (
      <div className="DisplayPropertiesItem">
        <div style={indent} className="DisplayPropertiesItem-label">
          {unCamelCase(displayProperties.name)}
        </div>
        <div onClick={this.searchTerms}
             className={classnames('DisplayPropertiesItem-search',
               {disabled: !this.isBinocularsEnabled()})}>
          <i className='icon-binoculars'/>
        </div>
        <div className="DisplayPropertiesItem-value">
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
