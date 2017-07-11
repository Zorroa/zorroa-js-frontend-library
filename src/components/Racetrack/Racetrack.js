import React, { Component, PropTypes, cloneElement } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Widget, { removeRaw } from '../../models/Widget'
import * as WidgetInfo from './WidgetInfo'

class Racetrack extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    isIconified: PropTypes.bool.isRequired,
    hoverFields: PropTypes.instanceOf(Set)
  }

  renderWidget (widget, isIconified) {
    const widgetInfo = Object.keys(WidgetInfo)
      .map(k => WidgetInfo[k])
      .find(widgetInfo => (widgetInfo.type === widget.type))
    if (!widget.isPinned) console.log('Rendering closed racetrack widget: ' + widget.type)
    const isPinned = true
    const isEnabled = widget.isEnabled
    const isOpen = true
    const floatBody = false
    return cloneElement(widgetInfo.element, {id: widget.id, isIconified, isPinned, isEnabled, isOpen, floatBody})
  }

  render () {
    const { widgets, isIconified, hoverFields } = this.props
    const openedWidgets = widgets && widgets.filter(widget => widget.isPinned)
    if (!openedWidgets || !openedWidgets.length) return
    return (
      <div className="Racetrack">
        {openedWidgets.map((widget, i) => (
          <div key={widget.id}
               className={classnames('Racetrack-widget', {hoverField: hoverFields.has(removeRaw(widget.field))})} >
            { this.renderWidget(widget, isIconified) }
          </div>
        ))}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  widgets: state.racetrack.widgets,
  hoverFields: state.app.hoverFields
})

export default connect(
  mapStateToProps
)(Racetrack)
