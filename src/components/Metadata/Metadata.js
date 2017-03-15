import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import { iconifyRightSidebar, updateMetadataFields,
  toggleCollapsible, hoverField, clearHoverField } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { getAssetFields } from '../../actions/assetsAction'
import { unCamelCase } from '../../services/jsUtil'
import { modifyRacetrackWidget, removeRacetrackWidgetIds, existsFields } from '../../actions/racetrackAction'
import { createFacetWidget, createMapWidget, fieldUsedInWidget } from '../../models/Widget'

class Metadata extends Component {
  static propTypes = {
    // state props
    metadataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    collapsibleOpen: PropTypes.object,
    existsFields: PropTypes.instanceOf(Set),
    fieldTypes: PropTypes.object,
    aggs: PropTypes.object,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  state = {
    filterString: '',
    filteredFields: [],
    showFavorites: true,
    existsFields: this.props.existsFields,
    filteredComponents: [],
    collapsibleOpen: {},
    aggs: {},
    aggFields: [],
    metadataFields: this.props.metadataFields
  }

  componentWillMount () {
    this.updateFilteredFields(this.props)
    this.props.actions.getAssetFields()
  }

  componentWillReceiveProps (nextProps) {
    this.updateFilteredFields(nextProps)
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  changeFilterString = (event) => {
    this.setStatePromise({ filterString: event.target.value })
      .then(() => this.updateFilteredFields(this.props))
  }

  isFavorite (fieldTypes, hasChildren, namespace, metadataFields) {
    let isFavorite
    if (hasChildren) {
      isFavorite = true
      const children = Object.keys(fieldTypes).filter(f => f.startsWith(namespace) && f.charAt(namespace.length) === '.')
      for (let j = 0; j < children.length; ++j) {
        const child = children[j]
        if (metadataFields.findIndex(f => (f === child)) < 0) {
          isFavorite = false
          break
        }
      }
    } else {
      isFavorite = metadataFields.findIndex(f => (f === namespace)) >= 0
    }
    return isFavorite
  }

  favorite = (field, namespace, event) => {
    const { metadataFields, fieldTypes, user, userSettings } = this.props
    const hasChildren = field.length !== namespace.length
    const isFavorite = this.isFavorite(fieldTypes, hasChildren, namespace, metadataFields)
    const all = Object.keys(this.props.fieldTypes)
    let fields
    if (isFavorite) {
      fields = metadataFields.filter(f => !f.startsWith(namespace))
    } else {
      const children = all.filter(f => (f.startsWith(namespace) && f.charAt(namespace.length) === '.'))
      const union = new Set([...metadataFields, ...children, field])
      fields = [...union]
    }
    this.props.actions.updateMetadataFields(fields)
    const settings = {
      ...userSettings,
      metadataFields: fields,
      tableFields: []   // Remove deprecated setting
    }
    this.props.actions.saveUserSettings(user, settings)
    event.stopPropagation()
  }

  showFavorites = (show) => {
    this.setStatePromise({showFavorites: show})
      .then(() => this.updateFilteredFields(this.props))
  }

  deselectAll = () => {
    this.props.actions.existsFields(new Set())
  }

  toggleCollapsible = (key, event) => {
    const { actions, collapsibleOpen } = this.props
    actions.toggleCollapsible(key, !collapsibleOpen[key])
    event.stopPropagation()
  }

  select = (field) => {
    const existsFields = new Set(this.props.existsFields)
    if (existsFields.has(field)) {
      existsFields.delete(field)
    } else {
      existsFields.add(field)
    }
    this.props.actions.existsFields(existsFields)
  }

  toggleWidget = (field, event) => {
    const { widgets, fieldTypes } = this.props
    const index = widgets.findIndex(widget => fieldUsedInWidget(field, widget))
    if (index >= 0) {
      this.props.actions.removeRacetrackWidgetIds([widgets[index].id])
    } else {
      const type = fieldTypes[field]
      const terms = null
      const term = null
      const facet = type === 'point' ? createMapWidget(field, term) : createFacetWidget(field, terms, fieldTypes)
      this.props.actions.modifyRacetrackWidget(facet)
      this.props.actions.iconifyRightSidebar(false)
    }
    event.stopPropagation()
  }

  hover = (field) => {
    this.props.actions.hoverField(field)
  }

  clearHover = (field) => {
    this.props.actions.clearHoverField(field)
  }

  showFavorites = (show) => {
    this.setStatePromise({showFavorites: show})
      .then(() => this.updateFilteredFields(this.props))
  }

  deselectAll = () => {
    this.props.actions.existsFields(new Set())
  }

  isLeaf (field, namespace) {
    return field === namespace || field === `${namespace}.raw`
  }

  // Update the filteredFields component list, caching heavily based on all
  // the factors that affect the components: fields, open collapsibles, and aggs.
  updateFilteredFields (props) {
    const {fieldTypes, collapsibleOpen, aggs, existsFields, metadataFields} = props
    const modifiedExists = JSON.stringify([...existsFields]) !== JSON.stringify([...this.state.existsFields])
    const modifiedFavorites = JSON.stringify(metadataFields) !== JSON.stringify(this.state.metadataFields)

    // Filter all fields by string and sort
    const fields = this.state.showFavorites ? metadataFields : Object.keys(fieldTypes)
    const lcFilterString = this.state.filterString.toLowerCase()
    const filteredFields = fields.filter(field => (field.toLowerCase().includes(lcFilterString))).sort()
    if (JSON.stringify(filteredFields) !== JSON.stringify(this.state.filteredFields) ||
        JSON.stringify(collapsibleOpen) !== JSON.stringify(this.state.collapsibleOpen) ||
        JSON.stringify(aggs) !== JSON.stringify(this.state.aggs) || modifiedExists || modifiedFavorites) {
      // Unroll the fields iteratively into an item element array
      const filteredComponents = []
      const aggFields = []
      let ancestors = []
      const addFields = (ancestors, field) => {
        const parents = field.split('.')
        for (let i = 0; i < parents.length; ++i) {
          const namespace = parents.slice(0, i + 1).join('.')
          const index = ancestors.findIndex(ancestor => (ancestor.namespace === namespace))
          const isOpen = collapsibleOpen[namespace]
          const isSelected = existsFields.has(namespace)
          if (index < 0) {
            const hasChildren = i < parents.length - 1
            const isFavorite = this.isFavorite(fieldTypes, hasChildren, namespace, metadataFields)
            filteredComponents.push(this.renderField(field, namespace, parents[i], i, hasChildren, isOpen, isSelected, isFavorite))
            ancestors.splice(i)
            ancestors.push({field, namespace})
            aggFields.push(namespace)
          } else if (collapsibleOpen[ancestors[index].namespace]) {
            continue
          }
          if (!isOpen) break
        }
      }

      // Create an array of child components and save changes to the Racetrack aggs
      filteredFields.forEach(field => {
        addFields(ancestors, field)
      })
      const modifiedAggFields = JSON.stringify(aggFields) !== JSON.stringify(this.state.aggFields)
      if (modifiedAggFields || modifiedExists || modifiedFavorites ||
        JSON.stringify(aggs) !== JSON.stringify(this.state.aggs)) {
        this.setState({filteredComponents})
      }

      this.setState({filteredFields, collapsibleOpen, aggs, existsFields, aggFields, metadataFields})
    }
  }

  renderField (field, namespace, name, depth, hasChildren, isOpen, isSelected, isFavorite) {
    const id = `${field}-${namespace}`
    const isLeaf = this.isLeaf(field, namespace)
    const isSearched = isLeaf && this.props.widgets.findIndex(widget => fieldUsedInWidget(field, widget)) >= 0
    return (
      <div className={classnames('Metadata-item', {isSelected, isLeaf})}
           key={id} style={{ paddingLeft: `${depth * 14}px` }}
           onClick={e => this.select(namespace)}
           onMouseOver={e => this.hover(namespace)} onMouseOut={e => this.clearHover(namespace)} >
        <div className="Metadata-left">
          <div className={classnames('Metadata-item-toggle', {hasChildren})}
               onClick={e => this.toggleCollapsible(namespace, e)}>
            { hasChildren && <div className={classnames('Metadata-toggleArrow', 'icon-triangle-down', {isOpen})}/> }
          </div>
          <div className="Metadata-item-label">
            {unCamelCase(name)}
          </div>
        </div>
        <div className="Metadata-right">
          <div onClick={e => this.favorite(field, namespace, e)}
               className={classnames('Metadata-item-favorite', 'icon-star', {isSelected: isFavorite})}/>
          <div onClick={isLeaf && (e => this.toggleWidget(field, e))}
               className={classnames('Metadata-item-search', 'icon-binoculars', {isSelected: isSearched})} />
        </div>
      </div>
    )
  }

  renderDeselector () {
    const { existsFields } = this.state
    if (!existsFields || existsFields.size === 0) return null
    return (
      <div className="Metadata-selected">
        { `${existsFields.size} fields selected` }
        <div onClick={this.deselectAll} className="Metadata-deselect-all icon-cancel-circle"/>
      </div>
    )
  }

  render () {
    const { filterString, filteredComponents, showFavorites } = this.state
    return (
      <div className="Metadata">
        <div className="Metadata-header">
          <div className="Metadata-filter">
            <input type="text" onChange={this.changeFilterString}
                   value={filterString} placeholder="Filter Metadata" />
            <div className="icon-search"/>
          </div>
        </div>
        <div className="Metadata-view">
          <div className={classnames('Metadata-favorites', {isSelected: showFavorites})}>
            <div onClick={e => this.showFavorites(true)} className="Metadata-favorites-favorites">
              <div className={`Metadata-favorites-icon icon-star${showFavorites ? '' : '-empty'}`}/>
              <div className="Metadata-favorites-label">Favorites</div>
            </div>
            <div onClick={e => this.showFavorites(false)} className="Metadata-favorites-all">All</div>
          </div>
          { this.renderDeselector() }
        </div>
        <div className="body">
          {filteredComponents}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  metadataFields: state.app.metadataFields,
  widgets: state.racetrack.widgets,
  collapsibleOpen: state.app.collapsibleOpen,
  existsFields: state.racetrack.existsFields,
  fieldTypes: state.assets.types,
  aggs: state.assets.aggs,
  user: state.auth.user,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    iconifyRightSidebar,
    updateMetadataFields,
    getAssetFields,
    saveUserSettings,
    toggleCollapsible,
    modifyRacetrackWidget,
    removeRacetrackWidgetIds,
    existsFields,
    hoverField,
    clearHoverField
  }, dispatch)
}))(Metadata)
