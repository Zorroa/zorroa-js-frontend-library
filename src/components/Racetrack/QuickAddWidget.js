import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { KEY_COLOR } from '../../constants/themeDefaults'
import DisplayOptions from '../DisplayOptions'
import AddWidget from './AddWidget'
import Permission from '../../models/Permission'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { showModal, dialogAlertPromise } from '../../actions/appActions'
import { getAllPermissions } from '../../actions/permissionsAction'

class QuickAddWidget extends Component {
  static propTypes = {
    fieldTypes: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object),
    permissions: PropTypes.arrayOf(PropTypes.instanceOf(Permission)),
    actions: PropTypes.object,
    keyColor: PropTypes.string.isRequired,
    whiteLabelEnabled: PropTypes.bool.isRequired,
  }

  state = {
    filterText: '',
    selectedWidgetInfo: null,
  }

  componentWillMount() {
    this.props.actions.getAllPermissions()
  }

  addWidget = (widgetInfo, event) => {
    if (
      widgetInfo.fieldTypes &&
      !widgetInfo.fieldTypes.length &&
      !widgetInfo.fieldRegex
    ) {
      this.updateDisplayOptions(event, {}, widgetInfo)
      this.dismiss(event)
      return
    }

    const width = '75%'
    const body = (
      <DisplayOptions
        title="Search Field"
        singleSelection={true}
        fieldTypes={widgetInfo.fieldTypes}
        fieldRegex={widgetInfo.fieldRegex}
        selectedFields={[]}
        onUpdate={(event, state) =>
          this.updateDisplayOptions(event, state, widgetInfo)
        }
      />
    )
    this.props.actions.showModal({ body, width })
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state, widgetInfo) => {
    const field =
      state.checkedNamespaces &&
      state.checkedNamespaces.length &&
      state.checkedNamespaces[0]
    const fieldType = this.props.fieldTypes[field]
    const widget = widgetInfo.create(field, fieldType)
    this.props.actions.modifyRacetrackWidget(widget)
    this.dismiss(event)
  }

  changeFilterText = event => {
    this.setState({ filterText: event.target.value, selectedWidgetInfo: null })
  }

  selectCurrent = event => {
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
      this.setState({ selectedWidgetInfo: widgetInfos[0] })
    }
    const index = widgetInfos.findIndex(
      widgetInfo => widgetInfo.type === selectedWidgetInfo.type,
    )
    if (index > 0) {
      this.setState({ selectedWidgetInfo: widgetInfos[index - 1] })
    }
  }

  next = () => {
    const { selectedWidgetInfo } = this.state
    const widgetInfos = this.widgetInfos()
    if (!widgetInfos || !widgetInfos.length) return
    if (!selectedWidgetInfo) {
      this.setState({ selectedWidgetInfo: widgetInfos[0] })
    }
    const index = selectedWidgetInfo
      ? widgetInfos.findIndex(
          widgetInfo => widgetInfo.type === selectedWidgetInfo.type,
        )
      : -1
    if (index < widgetInfos.length - 1) {
      this.setState({ selectedWidgetInfo: widgetInfos[index + 1] })
    }
  }

  keyDown = event => {
    switch (event.key) {
      case 'Enter':
        return this.selectCurrent()
      case 'Tab':
        return this.selectCurrent()
      case 'ArrowUp':
        return this.previous()
      case 'ArrowDown':
        return this.next()
      case 'Escape':
        return this.dismiss()
      default:
    }
  }

  focus = () => {
    // FIXME: Storing focus as state breaks clicking on widget items.
    this.focused = !this.focused
    this.setState({ selectedWidgetInfo: null, filterText: '' })
  }

  blur = () => {
    this.dismiss()
  }

  dismiss = () => {
    this.focused = false
    this.setState({ selectedWidgetInfo: null, filterText: '' })
  }

  widgetInfos() {
    const { widgets, permissions } = this.props
    const { filterText } = this.state
    if (!this.focused && !filterText.length) return []
    return AddWidget.widgetInfos(widgets, filterText, permissions)
  }

  getKeyColor() {
    if (this.props.whiteLabelEnabled === true) {
      return this.props.keyColor
    }

    return KEY_COLOR
  }

  render() {
    const { selectedWidgetInfo } = this.state
    const widgetInfos = this.widgetInfos()
    return (
      <div className="QuickAddWidget Racebar-add-widget">
        <div
          className="QuickAddWidget-input-container "
          style={{ backgroundColor: this.getKeyColor() }}
          title="Add a new search widget">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
            <path
              fill="#FFF"
              fillRule="evenodd"
              d="M4 4V0h2v4h4v2H6v4H4V6H0V4h4z"
            />
          </svg>
          <button className="QuickAddWidget-label" onClick={this.focus}>
            Add Widget
          </button>
          <input
            value={this.state.filterText}
            onChange={this.changeFilterText}
            onKeyDown={this.keyDown}
            onClick={this.focus}
            onBlur={this.blur}
            className="QuickAddWidget-input"
            placeholder="Quick Add - Widget"
          />
        </div>
        {widgetInfos.length > 0 && (
          <div className="QuickAddWidget-list">
            {widgetInfos.map(widgetInfo => {
              if (widgetInfo.hideFromQuickAdd === true) {
                return null
              }

              const quickAddWidgetItemClasses = classnames(
                'QuickAddWidget-item',
                `widget-${widgetInfo.type}`,
                {
                  selected:
                    selectedWidgetInfo &&
                    widgetInfo.type === selectedWidgetInfo.type,
                },
              )

              return (
                <div
                  onMouseDown={e => this.addWidget(widgetInfo, e)}
                  style={{ backgroundColor: widgetInfo.color }}
                  className={quickAddWidgetItemClasses}
                  key={widgetInfo.type}>
                  <span
                    className={`QuickAddWidget-item-icon ${widgetInfo.icon}`}
                  />
                  <span>{widgetInfo.title}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
}

export default connect(
  state => ({
    fieldTypes: state.assets.types,
    widgets: state.racetrack.widgets,
    permissions: state.permissions.all,
    keyColor: state.theme.keyColor,
    whiteLabelEnabled: state.theme.whiteLabelEnabled,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        modifyRacetrackWidget,
        getAllPermissions,
        dialogAlertPromise,
        showModal,
      },
      dispatch,
    ),
  }),
)(QuickAddWidget)
