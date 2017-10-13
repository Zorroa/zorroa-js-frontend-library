import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Toggle from '../Toggle'
import DisplayOptions from '../DisplayOptions'
import * as WidgetInfo from './WidgetInfo'
import Permission from '../../models/Permission'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { showModal, hideModal } from '../../actions/appActions'

class AddWidget extends Component {
  static propTypes = {
    fieldTypes: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object),
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object
  }

  state = {
    filterText: '',
    showDescriptions: false
  }

  addWidget = (widgetInfo, event) => {
    if (widgetInfo.fieldTypes && !widgetInfo.fieldTypes.length && !widgetInfo.fieldRegex) {
      this.updateDisplayOptions(event, {}, widgetInfo)
      this.dismiss(event)
      return
    }
    const width = '75%'
    const body = <DisplayOptions title='Search Field'
                                 singleSelection={true}
                                 fieldTypes={widgetInfo.fieldTypes}
                                 fieldRegex={widgetInfo.fieldRegex}
                                 selectedFields={[]}
                                 onUpdate={(event, state) => this.updateDisplayOptions(event, state, widgetInfo)}/>
    this.props.actions.showModal({body, width})
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state, widgetInfo) => {
    const field = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    const fieldType = this.props.fieldTypes[field]
    const widget = widgetInfo.create(field, fieldType)
    this.props.actions.modifyRacetrackWidget(widget)
  }

  toggleShowDescriptions = (event) => {
    this.setState({showDescriptions: event.target.checked})
  }

  dismiss = (event) => {
    this.props.actions.hideModal()
  }

  changeFilterText = (event) => {
    this.setState({filterText: event.target.value})
  }

  clearFilterText = (event) => {
    this.setState({filterText: ''})
  }

  // static because this filter is also used in QuickAddWidget
  static widgetInfos = (widgets, filterText, permissions) => {
    const filter = filterText.toLowerCase()
    const singletonTypes = new Set([
      WidgetInfo.FiletypeWidgetInfo.type, WidgetInfo.CollectionsWidgetInfo.type,
      WidgetInfo.MultipageWidgetInfo.type, WidgetInfo.ImportSetWidgetInfo.type ])
    const singletons = new Set()
    widgets.forEach(widget => {
      if (singletonTypes.has(widget.type)) singletons.add(widget.type)
    })
    return Object.keys(WidgetInfo).map(k => WidgetInfo[k]).filter(widgetInfo => (
      widgetInfo.element &&
      !singletons.has(widgetInfo.type)) &&
      widgetInfo.title.toLowerCase().includes(filter) &&
      AddWidget.hasPermission(widgetInfo.permissions, permissions)
    )
  }

  static hasPermission = (widgetPermissions, permissions) => {
    if (!widgetPermissions) return true
    for (let i = 0; i < widgetPermissions.length; ++i) {
      const permission = widgetPermissions[i]
      if (permissions.findIndex(p => (p.name === permission.name && p.type === permission.type)) >= 0) return true
    }
    return false
  }

  render () {
    const { widgets, permissions } = this.props
    const { filterText, showDescriptions } = this.state
    const isEmptyFilter = !filterText || !filterText.length
    return (
      <div className="AddWidget">
        <div className="header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="AddWidget-icon icon-search"/>
            <div>Add Search Widget</div>
          </div>
          <div className='AddWidget-close icon-cross' onClick={this.dismiss}/>
        </div>
        <div className="controls">
          <div className="filter">
            <div className="filter-input">
              <input type="text" value={filterText} onChange={this.changeFilterText}
                     placeholder="Quick lookup search widgets" />
              <div onClick={this.clearFilterText} className={classnames('icon-cancel-circle', {isEmptyFilter})}/>
            </div>
            <div className="icon-search"/>
          </div>
        </div>
        <div className="body">
          <div className="search-info">
            <label htmlFor="showDescription" className="search-info-label">Show Search Information</label>
            <Toggle checked={showDescriptions} onChange={this.toggleShowDescriptions} />
            <div className="text-val">{showDescriptions ? 'On' : 'Off'}</div>
          </div>
          <div className="widget-grid">
            { AddWidget.widgetInfos(widgets, filterText, permissions).map(widgetInfo => (
              <div className={`widget widget-${widgetInfo.type}`} key={widgetInfo.type}>
                <div className="title-bar" style={{backgroundColor: widgetInfo.color}}
                     onClick={showDescriptions ? null : this.addWidget.bind(this, widgetInfo)}>
                  <div className="flexRowCenter">
                    <div className={`widget-icon ${widgetInfo.icon}`}/>
                    <div>{widgetInfo.title}</div>
                  </div>
                  <div className="widget-help icon-question"/>
                </div>
                { showDescriptions ? (
                  <div className="widget-description">
                    <div className="info-text">{widgetInfo.description}</div>
                    <button onClick={this.addWidget.bind(this, widgetInfo)} style={{backgroundColor: widgetInfo.color}} className="add-button">Add Widget</button>
                  </div>
                ) : <div/> }
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  fieldTypes: state.assets.types,
  widgets: state.racetrack.widgets,
  permissions: state.permissions.all
}), dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, showModal, hideModal }, dispatch)
}))(AddWidget)
