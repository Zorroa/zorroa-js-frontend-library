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
    selectedWidgetType: null
  }

  pushWidgetType (type) {
    this.props.actions.modifyRacetrackWidget(new Widget({type}))
    this.dismiss()
  }

  changeFilterText = (event) => {
    this.setState({ filterText: event.target.value, selectedWidgetType: null })
  }

  selectCurrent = () => {
    const { selectedWidgetType } = this.state
    if (selectedWidgetType) {
      this.pushWidgetType(selectedWidgetType)
    } else {
      const widgetInfos = this.widgetInfos()
      if (!widgetInfos || !widgetInfos.length) return
      this.pushWidgetType(widgetInfos[0].type)
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
      case 'Enter': return this.selectCurrent()
      case 'Tab': return this.selectCurrent()
      case 'ArrowUp': return this.previous()
      case 'ArrowDown': return this.next()
      case 'Escape': return this.dismiss()
      default:
    }
  }

  focus = () => {
    // FIXME: Storing focus as state breaks clicking on widget items.
    this.focused = true
    this.setState({selectedWidgetType: null, filterText: ''})
  }

  blur = () => {
    this.dismiss()
  }

  dismiss = () => {
    this.focused = false
    this.setState({selectedWidgetType: null, filterText: ''})
  }

  widgetInfos () {
    const { filterText } = this.state
    const filter = filterText.toLowerCase()
    return this.focused || filter.length ? Object.keys(WidgetInfo)
      .map(k => WidgetInfo[k])
      .filter(widgetInfo => (
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
          <div className="QuickAddWidget-list">
            { widgetInfos.map(widgetInfo => (
              <div onMouseDown={this.pushWidgetType.bind(this, widgetInfo.type)}
                   className={classnames('QuickAddWidget-item', `QuickAddWidget-${widgetInfo.type}`,
                    {selected: widgetInfo.type === selectedWidgetType})}
                   key={widgetInfo.type}>
                <i className={`QuickAddWidget-item-icon ${widgetInfo.icon}`}></i>
                  <span>{widgetInfo.title}</span>
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
