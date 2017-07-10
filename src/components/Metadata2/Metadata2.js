import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Filter from '../Filter'
import TableField from '../Table/TableField'
import Resizer from '../../services/Resizer'
import { minimalUniqueFieldTitle } from '../../models/Asset'
import { unCamelCase, equalSets } from '../../services/jsUtil'
import { getAssetFields, assetsForIds } from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import { widgetTypeForField, createFacetWidget } from '../../models/Widget'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { iconifyRightSidebar, updateMetadataFields,
  toggleCollapsible, hoverField, clearHoverField } from '../../actions/appActions'
import * as WidgetInfo from '../Racetrack/WidgetInfo'

class Metadata2 extends Component {
  static propTypes = {
    dark: PropTypes.bool,
    height: PropTypes.string.isRequired,
    assetIds: PropTypes.instanceOf(Set),
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    widgets: PropTypes.arrayOf(PropTypes.object),
    collapsibleOpen: PropTypes.object,
    fieldTypes: PropTypes.object,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object,
    actions: PropTypes.object
  }

  state = {
    selectedAssets: [],
    filterString: '',
    showNull: false,
    showFavorites: this.props.userSettings.showFavorites,
    titleWidth: 100
  }

  cachedAssetIds = new Set()

  componentWillMount () {
    this.resizer = new Resizer()
    this.componentWillReceiveProps(this.props)
  }

  componentWillUnmount () {
    this.resizer.release()
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.assetIds || !nextProps.assetIds.size) {
      if (this.state.selectedAssets.length) this.setState({selectedAssets: []})
      this.cachedAssetIds = new Set()
    } else if (!equalSets(this.cachedAssetIds, nextProps.assetIds)) {
      this.cachedAssetIds = new Set([...nextProps.assetIds])
      assetsForIds(nextProps.assetIds)
        .then(selectedAssets => this.setState({selectedAssets}))
        .catch(error => {
          console.log('Error getting selected assets: ' + error)
        })
    }
  }

  resizeStart = () => {
    this.resizer.capture(
      this.resize,                      /* onMove    */
      this.resizeDone,                  /* onRelease */
      this.state.titleWidth,            /* startX    */
      0,                                /* startY    */
      1,                                /* optScaleX */
      0)                                /* optScaleY */
  }

  resize = (w) => {
    const titleWidth = Math.min(500, Math.max(40, w))
    this.setState({titleWidth})
  }

  resizeDone = () => {
    this.forceUpdate()
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

  toggleFavorites = () => {
    const { user, userSettings } = this.props
    const showFavorites = !this.state.showFavorites
    this.setState({showFavorites})
    const settings = { ...userSettings, showFavorites }
    this.props.actions.saveUserSettings(user, settings)
  }

  toggleNull = () => {
    this.setState({showNull: !this.state.showNull})
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
    const { widgets, dark } = this.props
    if (dark) return
    const index = widgets.findIndex(widget => (widget.field === field))
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

  createTagFacet = (term, field, event) => {
    if (this.props.dark) return
    const fieldType = this.props.fieldTypes[field]
    field = field && field.endsWith('.raw') ? field : field + '.raw'
    const index = this.props.widgets.findIndex(widget => (widget.field === field))
    let terms = [term]
    if (index >= 0 && event.shiftKey) {       // Add to terms for shift
      const widget = this.props.widgets[index]
      if (widget.sliver && widget.sliver.filter && widget.sliver.filter.terms) {
        terms = [...widget.sliver.filter.terms[field], term]
      }
    }
    const widget = createFacetWidget(field, fieldType, terms)
    if (index >= 0) widget.id = this.props.widgets[index].id
    this.props.actions.modifyRacetrackWidget(widget)
    this.props.actions.iconifyRightSidebar(false)
    event.stopPropagation()
  }

  hover = (field) => {
    if (this.props.dark) return
    this.props.actions.hoverField(field)
  }

  clearHover = (field) => {
    if (this.props.dark) return
    this.props.actions.clearHoverField(field)
  }

  isLeaf (field, namespace) {
    return field === namespace || field === `${namespace}.raw`
  }

  renderNamespace (namespace, isOpen) {
    const itemClass = namespace.replace('.', '-')
    return (
      <div key={itemClass}
           onClick={e => this.toggleCollapsible(`meta2-${namespace}`, e)}
           className={classnames('Metadata2-namespace', 'Metadata2-namespace-' + itemClass, {isOpen})}>
        <div className="Metadata2-namespace-title">
          {unCamelCase(namespace)}
        </div>
        <div className={classnames('Metadata2-namespace-toggle', 'icon-chevron-down', {isOpen})}/>
      </div>
    )
  }

  renderValue (field, namespace, asset, isFavorite) {
    if (asset === null) {
      return <div className="Metadata2-value-various">Various</div>
    } else if (asset.rawValue(field) === undefined) {
      return <div className="Metadata2-value-null">null</div>
    } else if (asset) {
      return (
        <div className="Metadata2-value">
          <TableField asset={asset} field={field} isOpen={true} dark={this.props.dark} onTag={this.createTagFacet}/>
        </div>
      )
    }
    return <div className="Metadata2-value-null">null</div>
  }

  renderLeaf (field, namespace, fields, isSelected, isFavorite, widgetIcon) {
    const { selectedAssets, titleWidth, showNull } = this.state
    const itemClass = field.replace('.', '-')
    let asset
    if (selectedAssets && selectedAssets.length) {
      asset = selectedAssets[0]
      const value = selectedAssets[0].rawValue(field)
      for (let i = 1; i < selectedAssets.length; ++i) {
        const v = selectedAssets[i].rawValue(field)
        if (v !== value) {
          asset = null
          break
        }
      }
    }
    if (asset === undefined) return
    if (!showNull && asset && asset.rawValue(field) === undefined) return
    const { head, tails } = minimalUniqueFieldTitle(field, fields, 1)
    const tail = tails && '\u2039 ' + tails.join(' \u2039 ')
    return (
      <div key={itemClass} className={classnames('Metadata2-leaf', {isSelected})}
           title={field}
           onMouseOver={e => this.hover(namespace)} onMouseOut={e => this.clearHover(namespace)}
           onClick={e => this.toggleWidget(field, e)}>
        <div className="Metadata2-leaf-title" style={{minWidth: titleWidth, maxWidth: titleWidth}}>
          <div className="Metadata2-leaf-title-head">
            {unCamelCase(head)}
          </div>
          { tail && <div className="Metadata2-leaf-title-tail">{tail}</div> }
        </div>
        { this.renderValue(field, namespace, asset, isFavorite) }
      </div>
    )
  }

  renderFields () {
    const { selectedAssets } = this.state
    if (!selectedAssets || !selectedAssets.length) {
      const empty = (
        <div key="no-assets" className="Metadata2-no-assets">
          <div className="Metadata2-no-assets-icon icon-emptybox"/>
          No Assets Selected
        </div>
      )
      return [empty]
    }
    const { fieldTypes, metadataFields, collapsibleOpen, widgets, dark } = this.props
    const fields = this.state.showFavorites ? metadataFields : Object.keys(fieldTypes)
    const lcFilterString = this.state.filterString.toLowerCase()
    const filteredFields = fields.filter(field => (field.toLowerCase().includes(lcFilterString))).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
    const namespaces = []
    const components = []
    const addField = (field) => {
      const parents = field.split('.')
      const namespace = parents[0]
      const isOpen = collapsibleOpen[`meta2-${namespace}`]
      const isLeaf = this.isLeaf(field, namespace)
      const hasChildren = false
      const isFavorite = this.isFavorite(fieldTypes, hasChildren, namespace, metadataFields)
      const isSearched = !dark && widgets.findIndex(widget => (widget.field === field)) >= 0
      const widgetType = widgetTypeForField(field, fieldTypes[field])
      const widgetIcon = this.widgetTypeIcon(widgetType)
      const leaf = this.renderLeaf(field, namespace, fields, isSearched, isFavorite, widgetIcon)
      const index = namespaces.findIndex(n => (n === namespace))
      if (leaf && !isLeaf && index < 0) {
        components.push(this.renderNamespace(namespace, isOpen))
        namespaces.push(namespace)  // Only render each namespace once
      }
      if (leaf && (isLeaf || isOpen)) components.push(leaf) // Wait until we know it is not null
    }
    filteredFields.forEach(field => addField(field))
    return components
  }

  render () {
    const { dark, height } = this.props
    const { filterString, showFavorites, titleWidth, showNull } = this.state
    return (
      <div className={classnames('Metadata2', {dark})} style={{height: height, maxHeight: height}}>
        <div className="Metadata2-header">
          <Filter className="box" value={filterString} dark={dark}
                  placeholder="Filter Metadata Fields"
                  onClear={_ => this.setState({filterString: ''})}
                  onChange={e => this.setState({filterString: e.target.value})}/>
          <div onClick={this.toggleNull} title="Filter to remove null-valued fields"
               className={classnames('Metadata2-nulls', 'icon-blocked',
                 {isSelected: !showNull})}/>
          <div onClick={this.toggleFavorites} title="Filter to show only favorite fields"
               className={classnames('Metadata2-favorites',
                 `icon-star-${showFavorites ? 'filled' : 'empty'}`,
                 {isSelected: showFavorites})}/>
        </div>
        <div className="Metadata2-body">
          <div className="Metadata2-scroll">
            { this.renderFields() }
            <div className={classnames('Metadata2-resizer', {active: this.resizer.active})}
                 style={{left: 6 + titleWidth}} onMouseDown={this.resizeStart}/>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  metadataFields: state.app.metadataFields,
  widgets: state.racetrack.widgets,
  collapsibleOpen: state.app.collapsibleOpen,
  fieldTypes: state.assets.types,
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
}))(Metadata2)
