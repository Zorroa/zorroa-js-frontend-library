import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Widget from '../../models/Widget'
import * as WidgetInfo from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { hideModal } from '../../actions/appActions'

class AddWidget extends Component {
  static propTypes = {
    actions: PropTypes.object
  }

  state = {
    filterText: '',
    showDescriptions: false
  }

  addWidget = (widgetInfo, event) => {
    const type = widgetInfo.type
    this.props.actions.modifyRacetrackWidget(new Widget({type}))
    this.dismiss(event)
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

  widgetInfos () {
    const { filterText } = this.state
    const filter = filterText.toLowerCase()
    return Object.keys(WidgetInfo).map(k => WidgetInfo[k]).filter(widgetInfo => (
      widgetInfo.title.toLowerCase().includes(filter)
    ))
  }

  render () {
    const { filterText, showDescriptions } = this.state
    const isEmptyFilter = !filterText || !filterText.length
    return (
      <div className="AddWidget">
        <div className="header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="icon-search"/>
            <div>Add Search Widget</div>
          </div>
          <div onClick={this.dismiss} className="icon-cross2"/>
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
          <div className="protip">
            <div>Pro tip! Use</div>
            <div className="key-equiv">alt+s</div>
            <div>to show this window at any time.</div>
          </div>
        </div>
        <div className="body">
          <div className="search-info">
            <label htmlFor="showDescription">Show Search Information</label>
            <input type="checkbox" name="showDescription" value={showDescriptions} onChange={this.toggleShowDescriptions}/>
            <div className="text-val">{showDescriptions ? 'On' : 'Off'}</div>
          </div>
          <div className="widget-grid">
            { this.widgetInfos().map(widgetInfo => (
              <div className="widget" key={widgetInfo.type}>
                <div className="title-bar" style={{backgroundColor: widgetInfo.color}}
                     onClick={showDescriptions ? null : this.addWidget.bind(this, widgetInfo)}>
                  <div className="flexRow">
                    <div className={widgetInfo.icon}/>
                    <div>{widgetInfo.title}</div>
                  </div>
                  <div className="icon-question"/>
                </div>
                { showDescriptions ? (
                  <div className="description">
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
}), dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, hideModal }, dispatch)
}))(AddWidget)
