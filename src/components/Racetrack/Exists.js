import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { createExistsWidget } from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import { ExistsWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import Widget from './Widget'
import Toggle from '../Toggle'
import { unCamelCase } from '../../services/jsUtil'

class Exists extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
  }

  static defaultProps = {
    query: new AssetSearch(),
  }

  state = {
    field: '',
    isMissing: false,
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState(nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => id === widget.id)
    const widget = widgets && widgets[index]
    if (widget && widget.sliver && widget.sliver.filter) {
      const isMissing = !!widget.sliver.filter.missing
      const field = isMissing
        ? widget.sliver.filter.missing[0]
        : widget.sliver.filter.exists[0]
      this.setState({ field, isMissing })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.query.equals(nextProps.query) === false) {
      this.syncWithAppState(nextProps)
    }
  }

  componentWillMount() {
    this.syncWithAppState(this.props, true)
  }

  modifySliver = (field, isMissing) => {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => id === widget.id)
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const widget = createExistsWidget(
      field,
      null,
      isMissing,
      isEnabled,
      isPinned,
    )
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
  }

  toggleMissing = event => {
    const isMissing = !event.target.checked
    this.setMissing(isMissing)
  }

  setMissing = isMissing => {
    this.setState({ isMissing })
    this.modifySliver(this.state.field, isMissing)
  }

  render() {
    const { id, floatBody, isOpen, onOpen, isIconified } = this.props
    const { field, isMissing } = this.state
    const lastName = Asset.lastNamespace(unCamelCase(field))
    const title = isMissing ? 'Missing' : 'Exists'
    return (
      <Widget
        className="Exists"
        id={id}
        isOpen={isOpen}
        onOpen={onOpen}
        floatBody={floatBody}
        title={title}
        field={lastName}
        backgroundColor={ExistsWidgetInfo.color}
        isIconified={isIconified}
        icon={ExistsWidgetInfo.icon}>
        <div className="Exists-body">
          <div className="Exists-exists">
            <div
              className="Exists-exists-label"
              onClick={_ => this.setMissing(false)}>
              exists
            </div>
            <Toggle
              checked={!this.state.isMissing}
              onChange={this.toggleMissing}
            />
            <div
              className="Exists-missing-label"
              onClick={_ => this.setMissing(true)}>
              missing
            </div>
          </div>
        </div>
      </Widget>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget }, dispatch),
})

const mapStateToProps = state => ({
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets,
})

export default connect(mapStateToProps, mapDispatchToProps)(Exists)
