import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Widget from '../../models/Widget'
import * as WidgetInfo from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'

class QuickAddWidget extends Component {
  static propTypes = {
    actions: PropTypes.object
  }

  state = {
    filterText: '',
    focused: false,
    selectedWidgetType: null
  }

  pushWidgetType (event, type) {
    event.preventDefault()
    this.props.actions.modifyRacetrackWidget(new Widget({type}))
  }

  changeFilterText = (event) => {
    this.setState({ filterText: event.target.value, selectedWidgetType: null })
  }

  selectCurrent = (event) => {
    const { selectedWidgetType } = this.state
    if (selectedWidgetType) {
      this.pushWidgetType(event, selectedWidgetType)
    } else {
      const widgetInfos = this.widgetInfos()
      if (!widgetInfos || !widgetInfos.length) return
      this.pushWidgetType(event, widgetInfos[0].type)
    }
    this.setState({ filterText: '' })
    this.blur()
  }

  previous = () => {
    const { selectedWidgetType } = this.state
    const widgetInfos = this.widgetInfos()
    if (!widgetInfos || !widgetInfos.length) return
    if (!selectedWidgetType || !selectedWidgetType.length) {
      this.setState({selectedWidgetType: widgetInfos[0].type})
    }
    const index = widgetInfos.findIndex(widgetInfo => (widgetInfo.type === selectedWidgetType))
    if (index > 0) {
      this.setState({selectedWidgetType: widgetInfos[index - 1].type})
    }
  }

  next = () => {
    const { selectedWidgetType } = this.state
    const widgetInfos = this.widgetInfos()
    if (!widgetInfos || !widgetInfos.length) return
    if (!selectedWidgetType || !selectedWidgetType.length) {
      this.setState({selectedWidgetType: widgetInfos[0].type})
    }
    const index = widgetInfos.findIndex(widgetInfo => (widgetInfo.type === selectedWidgetType))
    if (index < widgetInfos.length - 1) {
      this.setState({selectedWidgetType: widgetInfos[index + 1].type})
    }
  }

  keyDown = (event) => {
    switch (event.key) {
      case 'Enter': return this.selectCurrent(event)
      case 'Tab': return this.selectCurrent(event)
      case 'ArrowUp': return this.previous()
      case 'ArrowDown': return this.next()
      default:
    }
  }

  focus = () => {
    this.setState({focused: true})
  }

  blur = () => {
    this.setState({focused: false, selectedWidgetType: null})
  }

  widgetInfos () {
    const { filterText, focused } = this.state
    const filter = filterText.toLowerCase()
    return focused || filter.length ? Object.values(WidgetInfo).filter(widgetInfo => (
      widgetInfo.title.toLowerCase().includes(filter)
    )) : []
  }

  render () {
    const { selectedWidgetType } = this.state
    const widgetInfos = this.widgetInfos()
    return (
      <div className="QuickAddWidget">
        <input value={this.state.filterText} onChange={this.changeFilterText}
               onKeyDown={this.keyDown} onFocus={this.focus} onBlur={this.blur}
               placeholder="Quick Add - Widget"/>
        { widgetInfos.length ? (
          <div className="add-quick-list">
            { widgetInfos.map(widgetInfo => (
              <div onClick={this.pushWidgetType.bind(this, widgetInfo.type)}
                   className={classnames('add-quick-item', {selected: widgetInfo.type === selectedWidgetType})}
                   key={widgetInfo.type}>
                <div className={classnames('Racetrack-add-widget', `Racetrack-add-${widgetInfo.type}`)}>
                  <i className={`Racetrack-add-icon ${widgetInfo.icon}`}></i>
                  <span>{widgetInfo.title}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <div/> }
      </div>
    )
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget }, dispatch)
}))(QuickAddWidget)
