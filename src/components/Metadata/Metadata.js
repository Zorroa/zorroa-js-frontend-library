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
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { fieldUsedInWidget, widgetTypeForField } from '../../models/Widget'
import * as WidgetInfo from '../Racetrack/WidgetInfo'

class Metadata extends Component {
  static propTypes = {
    // state props
    metadataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    collapsibleOpen: PropTypes.object,
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

  cancelFilter = (event) => {
    this.setStatePromise({ filterString: '' })
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

  toggleFavorites = () => {
    this.setStatePromise({showFavorites: !this.state.showFavorites})
      .then(() => this.updateFilteredFields(this.props))
  }

  toggleCollapsible = (key, event) => {
    const { actions, collapsibleOpen } = this.props
    actions.toggleCollapsible(key, !collapsibleOpen[key])
    event.stopPropagation()
  }

  createWidget (field) {
    const { fieldTypes } = this.props
    const fieldType = fieldTypes[field]
    const type = widgetTypeForField(field, fieldType)
    const infos = Object.keys(WidgetInfo)
    for (let i = 0; i < infos.length; ++i) {
      const info = WidgetInfo[infos[i]]
      if (info.type === type) return info.create(field, fieldType)
    }
  }

  widgetTypeIcon (type) {
    const infos = Object.keys(WidgetInfo)
    for (let i = 0; i < infos.length; ++i) {
      const info = WidgetInfo[infos[i]]
      if (info.type === type) return info.icon
    }
  }

  toggleWidget = (field, event) => {
    const { widgets, fieldTypes } = this.props
    const index = widgets.findIndex(widget => fieldUsedInWidget(field, widget))
    if (index >= 0) {
      this.props.actions.removeRacetrackWidgetIds([widgets[index].id])
    } else {
      const widget = this.createWidget(field)
      if (widget) {
        this.props.actions.modifyRacetrackWidget(widget)
        this.props.actions.iconifyRightSidebar(false)
      }
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

  isLeaf (field, namespace) {
    return field === namespace || field === `${namespace}.raw`
  }

  // Update the filteredFields component list, caching heavily based on all
  // the factors that affect the components: fields, open collapsibles, and aggs.
  updateFilteredFields (props) {
    const {fieldTypes, collapsibleOpen, aggs, metadataFields} = props
    const modifiedFavorites = JSON.stringify(metadataFields) !== JSON.stringify(this.state.metadataFields)

    // Filter all fields by string and sort
    const fields = this.state.showFavorites ? metadataFields : Object.keys(fieldTypes)
    const lcFilterString = this.state.filterString.toLowerCase()
    const filteredFields = fields.filter(field => (field.toLowerCase().includes(lcFilterString))).sort()
    if (JSON.stringify(filteredFields) !== JSON.stringify(this.state.filteredFields) ||
        JSON.stringify(collapsibleOpen) !== JSON.stringify(this.state.collapsibleOpen) ||
        JSON.stringify(aggs) !== JSON.stringify(this.state.aggs) || modifiedFavorites) {
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
          if (index < 0) {
            const hasChildren = i < parents.length - 1
            const isFavorite = this.isFavorite(fieldTypes, hasChildren, namespace, metadataFields)
            const isLeaf = this.isLeaf(field, namespace)
            const isSearched = isLeaf && props.widgets.findIndex(widget => fieldUsedInWidget(field, widget)) >= 0
            const widgetType = !hasChildren && widgetTypeForField(field, fieldTypes[field])
            const widgetIcon = this.widgetTypeIcon(widgetType)
            filteredComponents.push(this.renderField(field, namespace, parents[i],
              i, hasChildren, isOpen, isSearched, isFavorite, widgetIcon))
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
      if (modifiedAggFields || modifiedFavorites ||
        JSON.stringify(aggs) !== JSON.stringify(this.state.aggs)) {
        this.setState({filteredComponents})
      }

      this.setState({filteredFields, collapsibleOpen, aggs, aggFields, metadataFields})
    }
  }

  renderPads (depth) {
    if (depth <= 0) return null
    let pads = []
    for (let i = 0; i < depth; ++i) pads.push(<div className="Metadata-item-pad"/>)
    return pads
  }

  renderField (field, namespace, name, depth, hasChildren, isOpen, isSelected, isFavorite, widgetIcon) {
    const id = `${field}-${namespace}`
    const isLeaf = this.isLeaf(field, namespace)
    return (
      <div className={classnames('Metadata-item', {isSelected, isLeaf})}
           key={id}
           onClick={e => hasChildren ? this.toggleCollapsible(namespace, e) : this.toggleWidget(field, e)}
           onMouseOver={e => this.hover(namespace)} onMouseOut={e => this.clearHover(namespace)} >
        <div className="Metadata-left">
          { this.renderPads(depth) }
          <div className={classnames('Metadata-item-toggle', {hasChildren})}
               onClick={e => this.toggleCollapsible(namespace, e)}>
            { hasChildren && <div className={classnames('Metadata-toggle-open', `icon-square-${isOpen ? 'minus' : 'plus'}`)}/> }
          </div>
          <div className={classnames('Metadata-item-label', {hasChildren})}>
            {unCamelCase(name)}
          </div>
        </div>
        <div className="Metadata-right">
          <div className={classnames('Metadata-item-widget', widgetIcon)} />
          <div onClick={e => this.favorite(field, namespace, e)}
               className={classnames('Metadata-item-favorite', 'icon-star-filled', {isSelected: isFavorite})}/>
        </div>
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
                   value={filterString} placeholder="Filter Tags" />
            { filterString && filterString.length && <div onClick={this.cancelFilter} className="Metadata-cancel-filter icon-cancel-circle"/> }
            <div className="icon-search"/>
          </div>
          <div onClick={this.toggleFavorites}
               className={classnames('Metadata-favorites',
                 `icon-star-${showFavorites ? 'filled' : 'empty'}`,
                 {isSelected: showFavorites})}/>
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
    hoverField,
    clearHoverField
  }, dispatch)
}))(Metadata)
