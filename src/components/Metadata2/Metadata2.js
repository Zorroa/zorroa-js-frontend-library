import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Filter from '../Filter'
import TableField from '../Table/TableField'
import Resizer from '../../services/Resizer'
import { unCamelCase, equalSets } from '../../services/jsUtil'
import { getAssetFields, assetsForIds } from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import { fieldUsedInWidget, widgetTypeForField } from '../../models/Widget'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { iconifyRightSidebar, updateMetadataFields,
  toggleCollapsible, hoverField, clearHoverField } from '../../actions/appActions'
import * as WidgetInfo from '../Racetrack/WidgetInfo'

class Metadata2 extends Component {
  static propTypes = {
    selectedAssetIds: PropTypes.instanceOf(Set),
    metadataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    collapsibleOpen: PropTypes.object,
    fieldTypes: PropTypes.object,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  state = {
    selectedAssets: [],
    filterString: '',
    showNull: false,
    showFavorites: false,
    titleWidth: 60
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
    if (!nextProps.selectedAssetIds || !nextProps.selectedAssetIds.size) {
      if (this.state.selectedAssets.length) this.setState({selectedAssets: []})
    } else if (!equalSets(this.cachedAssetIds, nextProps.selectedAssetIds)) {
      this.cachedAssetIds = new Set([...nextProps.selectedAssetIds])
      assetsForIds(nextProps.selectedAssetIds)
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
    this.setState({showFavorites: !this.state.showFavorites})
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
    const { widgets } = this.props
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

  isLeaf (field, namespace) {
    return field === namespace || field === `${namespace}.raw`
  }

  renderPads (depth) {
    if (depth <= 0) return null
    let pads = []
    for (let i = 0; i < depth; ++i) pads.push(<div key={i} className="Metadata2-item-pad"/>)
    return pads
  }

  renderNamespace (namespace, name, isOpen) {
    const itemClass = namespace.replace('.', '-')
    return (
      <div key={itemClass}
           onClick={e => this.toggleCollapsible(namespace, e)}
           className={classnames('Metadata2-namespace', 'Metadata2-namespace-' + itemClass, {isOpen})}>
        <div className="Metadata2-namespace-title">
          {unCamelCase(name)}
        </div>
        <div className={classnames('Metadata2-namespace-toggle', 'icon-chevron-down', {isOpen})}/>
      </div>
    )
  }

  renderValue (field, namespace, asset, isFavorite) {
    if (asset === null) {
      return <div className="Metadata2-value-various">Various</div>
    } else if (!asset.rawValue(field)) {
      return <div className="Metadata2-value-null">null</div>
    } else if (asset) {
      return (
        <div className="Metadata2-value">
          <TableField asset={asset} field={field}/>
          <div onClick={e => this.favorite(field, namespace, e)}
               className={classnames('Metadata2-item-favorite', 'icon-star-filled', {isSelected: isFavorite})}/>
        </div>
      )
    }
    return <div className="Metadata2-value-null">null</div>
  }

  renderLeaf (field, namespace, name, isSelected, isFavorite, widgetIcon) {
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
    if (!showNull && asset && !asset.rawValue(field)) return
    return (
      <div key={itemClass} className={classnames('Metadata2-leaf', {isSelected})}
           onMouseOver={e => this.hover(namespace)} onMouseOut={e => this.clearHover(namespace)}
           onClick={e => this.toggleWidget(field, e)}>
        <div className="Metadata2-leaf-title" style={{width: titleWidth}}>
          <div className="Metadata2-leaf-title-label">
            {unCamelCase(name)}
          </div>
        </div>
        { this.renderValue(field, namespace, asset, isFavorite) }
      </div>
    )
  }

  renderField (field, namespace, name, depth, hasChildren, isOpen, isSelected, isFavorite, widgetIcon) {
    const isLeaf = this.isLeaf(field, namespace)
    if (!isLeaf) return this.renderNamespace(namespace, name, isOpen)
    return this.renderLeaf(field, namespace, name, isSelected, isFavorite, widgetIcon)
  }

  renderFields () {
    const { fieldTypes, metadataFields, collapsibleOpen, widgets } = this.props
    const fields = this.state.showFavorites ? metadataFields : Object.keys(fieldTypes)
    const lcFilterString = this.state.filterString.toLowerCase()
    const filteredFields = fields.filter(field => (field.toLowerCase().includes(lcFilterString))).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
    const components = []
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
          const isSearched = isLeaf && widgets.findIndex(widget => fieldUsedInWidget(field, widget)) >= 0
          const widgetType = !hasChildren && widgetTypeForField(field, fieldTypes[field])
          const widgetIcon = this.widgetTypeIcon(widgetType)
          components.push(this.renderField(field, namespace, parents[i],
            i, hasChildren, isOpen, isSearched, isFavorite, widgetIcon))
          ancestors.splice(i)
          ancestors.push({field, namespace})
        } else if (collapsibleOpen[ancestors[index].namespace]) {
          continue
        }
        if (!isOpen) break
      }
    }
    filteredFields.forEach(field => addFields(ancestors, field))
    return components
  }

  render () {
    const { filterString, showFavorites, titleWidth, showNull } = this.state
    return (
      <div className="Metadata2">
        <div className="Metadata2-header">
          <Filter className="box" value={filterString}
                  placeholder="Filter Metadata Fields"
                  onClear={_ => this.setState({filterString: ''})}
                  onChange={e => this.setState({filterString: e.target.value})}/>
          <div onClick={this.toggleNull}
               className={classnames('Metadata2-favorites', 'icon-blocked',
                 {isSelected: !showNull})}/>
          <div onClick={this.toggleFavorites}
               className={classnames('Metadata2-favorites',
                 `icon-star-${showFavorites ? 'filled' : 'empty'}`,
                 {isSelected: showFavorites})}/>
        </div>
        <div className="Metadata2-body">
          { this.renderFields() }
          <div className={classnames('Metadata2-resizer', {active: this.resizer.active})}
               style={{left: 2 + titleWidth}} onMouseDown={this.resizeStart}/>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  selectedAssetIds: state.assets.selectedIds,
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
