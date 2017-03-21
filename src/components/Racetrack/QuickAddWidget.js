import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import DisplayOptions from '../DisplayOptions'
import AddWidget from './AddWidget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'

class QuickAddWidget extends Component {
  static propTypes = {
    fieldTypes: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.object
  }

  state = {
    filterText: '',
    selectedWidgetInfo: null
  }

  addWidget = (widgetInfo, event) => {
    if (widgetInfo.fieldTypes && !widgetInfo.fieldTypes.length) {
      this.updateDisplayOptions(event, {}, widgetInfo)
      this.dismiss(event)
      return
    }
    const width = '75%'
    const body = <DisplayOptions title='Search Field'
                                 singleSelection={true}
                                 fieldTypes={widgetInfo.fieldTypes}
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
    this.dismiss(event)
  }

  changeFilterText = (event) => {
    this.setState({ filterText: event.target.value, selectedWidgetInfo: null })
  }

  selectCurrent = (event) => {
    const { selectedWidgetInfo } = this.state
    if (selectedWidgetInfo) {
      this.addWidget(selectedWidgetInfo, event)
    } else {
      const widgetInfos = this.widgetInfos()
      if (!widgetInfos || !widgetInfos.length) return
      this.addWidget(widgetInfos[0], event)
    }
    this.setState({ filterText: '' })
    this.blur()
  }

  previous = () => {
    const { selectedWidgetInfo } = this.state
    const widgetInfos = this.widgetInfos()
    if (!widgetInfos || !widgetInfos.length) return
    if (!selectedWidgetInfo) {
      this.setState({selectedWidgetInfo: widgetInfos[0]})
    }
    const index = widgetInfos.findIndex(widgetInfo => (widgetInfo.type === selectedWidgetInfo.type))
    if (index > 0) {
      this.setState({selectedWidgetInfo: widgetInfos[index - 1]})
    }
  }

  next = () => {
    const { selectedWidgetInfo } = this.state
    const widgetInfos = this.widgetInfos()
    if (!widgetInfos || !widgetInfos.length) return
    if (!selectedWidgetInfo) {
      this.setState({selectedWidgetInfo: widgetInfos[0]})
    }
    const index = selectedWidgetInfo ? widgetInfos.findIndex(widgetInfo => (widgetInfo.type === selectedWidgetInfo.type)) : -1
    if (index < widgetInfos.length - 1) {
      this.setState({selectedWidgetInfo: widgetInfos[index + 1]})
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
    this.setState({selectedWidgetInfo: null, filterText: ''})
  }

  blur = () => {
    this.dismiss()
  }

  dismiss = () => {
    this.focused = false
    this.setState({selectedWidgetInfo: null, filterText: ''})
  }

  widgetInfos () {
    const { widgets } = this.props
    const { filterText } = this.state
    if (!this.focused && !filterText.length) return []
    return AddWidget.widgetInfos(widgets, filterText)
  }

  render () {
    const { selectedWidgetInfo } = this.state
    const widgetInfos = this.widgetInfos()
    return (
      <div className="QuickAddWidget">
        <div className="QuickAddWidget-input-container">
        <input value={this.state.filterText} onChange={this.changeFilterText}
               onKeyDown={this.keyDown} onFocus={this.focus} onBlur={this.blur}
               className="QuickAddWidget-input"
               placeholder="Quick Add - Widget"/>
          <div className="icon-search"/>
        </div>
        { widgetInfos.length ? (
          <div className="QuickAddWidget-list">
            { widgetInfos.map(widgetInfo => (
              <div onMouseDown={e => this.addWidget(widgetInfo, e)}
                   style={{backgroundColor: widgetInfo.color}}
                   className={classnames('QuickAddWidget-item',
                     {selected: selectedWidgetInfo && widgetInfo.type === selectedWidgetInfo.type})}
                   key={widgetInfo.type}>
                <span className={`QuickAddWidget-item-icon ${widgetInfo.icon}`}></span>
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
  fieldTypes: state.assets.types,
  widgets: state.racetrack.widgets
}), dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, showModal }, dispatch)
}))(QuickAddWidget)
