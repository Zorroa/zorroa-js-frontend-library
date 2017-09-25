import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Filter from '../Filter'
import { hideModal } from '../../actions/appActions'
import { archivistSettings, setArchivistSettings } from '../../actions/archivistAction'

class Settings extends Component {
  static propTypes = {
    settings: PropTypes.object,
    actions: PropTypes.object
  }

  state = {
    opened: new Set(),
    filter: '',
    showLiveOnly: false,
    columnWidth: { name: 200, category: 150, currentValue: 300, defaultValue: 300, description: 400 },
    modifiedValues: {}
  }

  componentWillMount () {
    this.props.actions.archivistSettings()
  }

  changeFilter = (event) => {
    this.setState({filter: event.target.value})
  }

  clearFilter = (event) => {
    this.setState({filter: ''})
  }

  sort = (a, b) => {
    if (a.category === b.category) return a.name.localeCompare(b.name)
    return a.category.localeCompare(b.category)
  }

  toggleShowLive = (event) => {
    this.setState({showLiveOnly: event.target.checked})
  }

  close = () => {
    this.props.actions.hideModal()
  }

  save = () => {
    this.props.actions.hideModal()
    this.props.actions.setArchivistSettings(this.state.modifiedValues)
  }

  scroll = (event) => {
    // Horizontal scrolling for the table header,
    // keep the header in perfect sync with the table body's horiz scroll
    document.getElementsByClassName('Settings-table-header')[0].style.left =
      `-${event.target.scrollLeft}px`
  }

  changeSetting = (event, setting) => {
    const modifiedValues = {...this.state.modifiedValues}
    modifiedValues[setting.name] = event.target.value
    if (event.target.value === setting.currentValue && modifiedValues[setting.name]) delete modifiedValues[setting.name]
    this.setState({modifiedValues})
  }

  render () {
    const { settings } = this.props
    const { filter, columnWidth, showLiveOnly, modifiedValues } = this.state
    const loader = require('../Header/loader-rolling.svg')
    const lcFilter = filter.toLowerCase()
    const filterSetting = (setting) => (
      (!showLiveOnly || setting.live) && (
      setting.name.toLowerCase().includes(lcFilter) ||
      setting.category.toLowerCase().includes(lcFilter) ||
      setting.currentValue.toLowerCase().includes(lcFilter) ||
      (setting.description && setting.description.toLowerCase().includes(lcFilter))))
    const canSave = Object.keys(modifiedValues).length > 0

    return (
      <div className="Settings">
        <div className="Settings-header">
          <div className="Settings-title-group">
            <div className="Settings-title-icon icon-server"/>
            <div className="Settings-title">Archivist Settings</div>
          </div>
          <div className="icon-cross Settings-close" onClick={this.close}/>
        </div>
        <div className="Settings-body">
          <div className="Settings-filter">
            <div className="Settings-filter-controls">
              <Filter value={filter} onChange={this.changeFilter}
                      onClear={this.clearFilter} placeholder="Filter Settings"/>
              <div className="Settings-show-live">
                <input type="checkbox" checked={showLiveOnly} onChange={this.toggleShowLive}/>
                <div className="Settings-show-live-label">Only Show Editable Settings</div>
              </div>
            </div>
            <div className="Settings-tip">Hover for values</div>
          </div>
          <div className="Settings-table-header">
            <div className="Settings-column" style={{minWidth: columnWidth.name}} >Name</div>
            <div className="Settings-column" style={{minWidth: columnWidth.category}} >Category</div>
            <div className="Settings-column" style={{minWidth: columnWidth.currentValue}} >Value</div>
            <div className="Settings-column" style={{minWidth: columnWidth.defaultValue}} >Default</div>
            <div className="Settings-column" style={{minWidth: columnWidth.description}} >Description</div>
          </div>
          <div className="Settings-settings" ref="SettingsSettings" onScroll={this.scroll}>
            { !settings && (
              <div className="Settings-loading">
                <img className="Header-loading" src={loader}/>
              </div>
            )}
            { settings && Object.keys(settings).map(k => settings[k]).filter(filterSetting).sort(this.sort).map(setting => (
              <div className={classnames('Settings-setting', {live: setting.live})} key={setting.name}>
                <div className="Settings-setting-name" style={{minWidth: columnWidth.name}} title={setting.name}>{setting.name}</div>
                <div className="Settings-setting-category" style={{minWidth: columnWidth.category}} title={setting.category}>{setting.category}</div>
                <textarea className="Settings-setting-value" style={{minWidth: columnWidth.currentValue}} disabled={!setting.live} value={modifiedValues[setting.name] !== undefined ? modifiedValues[settings.name] : setting.currentValue} title={setting.currentValue} onChange={e => this.changeSetting(e, setting)}/>
                <div className="Settings-setting-default" style={{minWidth: columnWidth.defaultValue}} title={setting.defaultValue}>{setting.defaultValue}</div>
                <div className="Settings-setting-description" style={{minWidth: columnWidth.description}} title={setting.description}>{setting.description}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="Settings-footer">
          <div className={classnames('Settings-save', {disabled: !canSave})} onClick={canSave ? this.save : null}>Save</div>
          <div className="Settings-cancel" onClick={this.close}>Cancel</div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  settings: state.archivist.settings
}), dispatch => ({
  actions: bindActionCreators({
    hideModal,
    archivistSettings,
    setArchivistSettings
  }, dispatch)
}))(Settings)
