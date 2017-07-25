import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import WidgetHeader from './WidgetHeader'
import { SimilarHashWidgetInfo, CollectionsWidgetInfo,
  SortOrderWidgetInfo, ImportSetWidgetInfo } from './WidgetInfo'
import { iconifyRightSidebar } from '../../actions/appActions'
import { sortAssets } from '../../actions/assetsAction'
import { modifyRacetrackWidget, removeRacetrackWidgetIds, similar } from '../../actions/racetrackAction'
import { selectFolderIds } from '../../actions/folderAction'
import { selectJobIds } from '../../actions/jobActions'

class Widget extends Component {
  static displayName = 'Widget'
  static propTypes = {
    id: PropTypes.number.isRequired,
    floatBody: PropTypes.bool.isRequired,
    children: PropTypes.node,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string,
    field: PropTypes.string,
    backgroundColor: PropTypes.string.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    className: PropTypes.string,
    widgets: PropTypes.arrayOf(PropTypes.object),
    uxLevel: PropTypes.number,
    monochrome: PropTypes.bool,
    actions: PropTypes.object
  }

  toggleEnabled = () => {
    const { isIconified, actions } = this.props
    if (isIconified) return
    const widget = this.widget()
    if (widget) {
      widget.isEnabled = !widget.isEnabled
      actions.modifyRacetrackWidget(widget)
    }
  }

  togglePinned = () => {
    const { isIconified, actions } = this.props
    if (isIconified) return
    const widget = this.widget()
    if (widget) {
      widget.isPinned = !widget.isPinned
      if (widget.isPinned) actions.iconifyRightSidebar(false)
      actions.modifyRacetrackWidget(widget)
    }
  }

  widget = () => {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    return widgets && index >= 0 && widgets[index]
  }

  removeFilter = () => {
    const widget = this.widget()
    if (widget && widget.type === SimilarHashWidgetInfo.type) this.props.actions.similar()
    if (widget && widget.type === SortOrderWidgetInfo.type) this.props.actions.sortAssets()
    if (widget && widget.type === CollectionsWidgetInfo.type) this.props.actions.selectFolderIds()
    if (widget && widget.type === ImportSetWidgetInfo.type) this.props.actions.selectJobIds()
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  render () {
    const { children, icon, title, field, backgroundColor, isIconified, floatBody, isOpen, onOpen, uxLevel } = this.props
    const widget = this.widget()
    const advanced = uxLevel > 0
    const isEnabled = !advanced || (widget && widget.isEnabled)
    const isPinned = advanced && widget && widget.isPinned
    const maxWidth = onOpen ? 360 : undefined   // Implicitly use onOpen to restrict width of Racebar widgets
    const WidgetHeaderParams = {
      icon,
      title,
      field,
      backgroundColor: backgroundColor,
      isEnabled,
      isPinned,
      maxWidth,
      isIconified,
      isOpen,
      onClose: this.removeFilter,
      enableToggleFn: advanced ? this.toggleEnabled : null,
      pinnedToggleFn: advanced ? this.togglePinned : null,
      collapseToggleFn: onOpen
    }

    const { className } = this.props
    const widgetClasses = classnames('Widget', 'flexCol', {'parent': children, floatBody, isOpen, isIconified, isEnabled, [className]: !!className})
    return (
      <div className={widgetClasses}>
        <WidgetHeader {...WidgetHeaderParams}/>
        { !isIconified && isOpen && (
          <div className={classnames('Widget-body', {floatBody})}>
            { children }
          </div>
        )}
      </div>
    )
  }
}

export default connect(
  state => ({
    widgets: state.racetrack && state.racetrack.widgets,
    uxLevel: state.app.uxLevel,
    monochrome: state.app.monochrome
  }), dispatch => ({
    actions: bindActionCreators({
      iconifyRightSidebar,
      similar,
      sortAssets,
      selectFolderIds,
      selectJobIds,
      modifyRacetrackWidget,
      removeRacetrackWidgetIds
    }, dispatch)
  })
)(Widget)
