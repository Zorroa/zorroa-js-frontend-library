import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import DisplayOptions from '../DisplayOptions'
import { iconifyRightSidebar, updateMetadataFields, updateTableFields,
  showModal, toggleCollapsible, hoverField, clearHoverField } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { getAssetFields } from '../../actions/assetsAction'
import { unCamelCase } from '../../services/jsUtil'
import { modifyRacetrackWidget, removeRacetrackWidgetIds, existsFields } from '../../actions/racetrackAction'
import { FacetWidgetInfo, MapWidgetInfo } from '../Racetrack/WidgetInfo'
import { createFacetWidget, createMapWidget } from '../../models/Widget'

function key ({field, namespace}) {
  return `${field}-${namespace}`
}

class Metadata extends Component {
  static propTypes = {
    // state props
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    tableFields: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    existsFields: new Set(),
    filteredComponents: [],
    collapsibleOpen: {},
    aggs: {},
    aggFields: []
  }

  componentWillReceiveProps (props) {
    this.updateFilteredFields(props)
  }

  componentWillMount () {
    this.updateFilteredFields(this.props)
    this.props.actions.getAssetFields()
  }

  changeFilterString = (event) => {
    this.setState({ filterString: event.target.value })
    this.updateFilteredFields(this.props)
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
    const { tableFields, user, actions } = this.props
    const { syncedViews, checkedNamespaces } = state
    console.log('Update metadata display options to:\n' + JSON.stringify(state.checkedNamespaces))
    actions.updateMetadataFields(checkedNamespaces)
    if (state.syncedViews) {
      actions.updateTableFields(checkedNamespaces)
    }
    const settings = {
      ...this.props.userSettings,
      metadataFields: checkedNamespaces,
      tableFields: syncedViews ? checkedNamespaces : tableFields
    }
    actions.saveUserSettings(user, settings)
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
    const index = this.widgetIndex(field)
    if (index >= 0) {
      this.props.actions.removeRacetrackWidgetIds([widgets[index].id])
    } else {
      const type = fieldTypes[field]
      const assets = null
      const term = null
      const facet = type === 'point' ? createMapWidget(field, term) : createFacetWidget(field, assets, fieldTypes)
      this.props.actions.modifyRacetrackWidget(facet)
      this.props.actions.iconifyRightSidebar(false)
    }
    event.stopPropagation()
  }

  hide = (field, namespace, event) => {
    const fields = this.props.fields.filter(field => (!field.startsWith(namespace)))
    this.props.actions.updateMetadataFields(fields)
    event.stopPropagation()
  }

  hover = (field) => {
    this.props.actions.hoverField(field)
  }

  clearHover = (field) => {
    this.props.actions.clearHoverField(field)
  }

  widgetIndex (field) {
    const { widgets } = this.props
    for (let i = 0; i < widgets.length; ++i) {
      const widget = widgets[i]
      switch (widget.type) {
        case FacetWidgetInfo.type:
          if (widget.sliver &&
            (widget.sliver.aggs.facet.terms.field === field ||
                widget.sliver.aggs.facet.terms.field === `${field}.raw`)) return i
          break
        case MapWidgetInfo.type:
          if (widget.sliver && widget.sliver.aggs &&
              widget.sliver.aggs.map.geohash_grid.field === field) return i
      }
    }
    return -1
  }

  isLeaf (field, namespace) {
    return field === namespace || field === `${namespace}.raw`
  }

  // Update the filteredFields component list, caching heavily based on all
  // the factors that affect the components: fields, open collapsibles, and aggs.
  updateFilteredFields (props) {
    const {fields, collapsibleOpen, aggs, existsFields} = props
    const modifiedExists = JSON.stringify([...existsFields]) !== JSON.stringify([...this.state.existsFields])

    // Filter all fields by string and sort
    const lcFilterString = this.state.filterString.toLowerCase()
    const filteredFields = fields.filter(field => (field.toLowerCase().includes(lcFilterString))).sort()
    if (JSON.stringify(filteredFields) !== JSON.stringify(this.state.filteredFields) ||
        JSON.stringify(collapsibleOpen) !== JSON.stringify(this.state.collapsibleOpen) ||
        JSON.stringify(aggs) !== JSON.stringify(this.state.aggs) || modifiedExists) {
      // Unroll the fields iteratively into an item element array
      const filteredComponents = []
      const aggFields = []
      let ancestors = []
      const addFields = (ancestors, field) => {
        const parents = field.split('.')
        for (let i = 0; i < parents.length; ++i) {
          const namespace = parents.slice(0, i + 1).join('.')
          const index = ancestors.findIndex(ancestor => (ancestor.namespace === namespace))
          const isOpen = collapsibleOpen[key({field, namespace})]
          const isSelected = existsFields.has(namespace)
          if (index < 0) {
            const hasChildren = i < parents.length - 1
            filteredComponents.push(this.renderField(field, namespace, parents[i], i, hasChildren, isOpen, isSelected))
            ancestors.splice(i)
            ancestors.push({field, namespace})
            aggFields.push(namespace)
          } else if (collapsibleOpen[key(ancestors[index])]) {
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
      if (modifiedAggFields || modifiedExists || JSON.stringify(aggs) !== JSON.stringify(this.state.aggs)) {
        this.setState({filteredComponents})
      }

      this.setState({filteredFields, collapsibleOpen, aggs, existsFields, aggFields})
    }
  }

  renderField (field, namespace, name, depth, hasChildren, isOpen, isSelected) {
    const id = key({field, namespace})
    const isLeaf = this.isLeaf(field, namespace)
    return (
      <div className={classnames('Metadata-item', {isSelected, isLeaf})}
           key={id} style={{ paddingLeft: `${depth * 10}px` }}
           onClick={e => this.select(namespace)}
           onMouseOver={e => this.hover(namespace)} onMouseOut={e => this.clearHover(namespace)} >
        <div className="Metadata-left">
          <div className={classnames('Metadata-item-toggle', {hasChildren})}
               onClick={e => this.toggleCollapsible(id, e)}>
            { hasChildren && <div className={classnames('Metadata-toggleArrow', 'icon-triangle-down', {isOpen})}/> }
          </div>
          <div className="Metadata-item-label">
            {unCamelCase(name)}
          </div>
        </div>
        <div className="Metadata-right">
          <div onClick={e => this.hide(field, namespace, e)} className="Metadata-item-hide icon-cancel-circle"/>
          {isLeaf && <div onClick={e => this.toggleWidget(field, e)} className={classnames('Metadata-item-search', 'icon-binoculars', {selected: this.widgetIndex(field) >= 0})} />}
        </div>
      </div>
    )
  }

  render () {
    const { filterString, filteredComponents } = this.state
    return (
      <div className="Metadata">
        <div className="Metadata-header">
          <div className="Metadata-filter">
            <input type="text" onChange={this.changeFilterString}
                   value={filterString} placeholder="Filter Metadata" />
            <div className="icon-search"/>
          </div>
          <div className="Metadata-settings" onClick={this.showDisplayOptions}>
            <i className="icon-cog"/>
          </div>
        </div>
        <div className="body">
          {filteredComponents}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  fields: state.app.metadataFields,
  widgets: state.racetrack.widgets,
  tableFields: state.app.tableFields,
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
    updateTableFields,
    getAssetFields,
    saveUserSettings,
    showModal,
    toggleCollapsible,
    modifyRacetrackWidget,
    removeRacetrackWidgetIds,
    existsFields,
    hoverField,
    clearHoverField
  }, dispatch)
}))(Metadata)
