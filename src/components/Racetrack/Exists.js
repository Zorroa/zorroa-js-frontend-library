import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { createExistsWidget } from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import { ExistsWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import Widget from './Widget'
import Toggle from '../Toggle'
import { unCamelCase } from '../../services/jsUtil'

class Exists extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    isEnabled: true,
    field: '',
    isMissing: false
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState (nextProps) {
    if (!this.state.isEnabled) return
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver && widget.sliver.filter) {
      const isMissing = !!widget.sliver.filter.missing
      const field = (isMissing) ? widget.sliver.filter.missing[0] : widget.sliver.filter.exists[0]
      this.setState({ field, isMissing })
    } else {
      this.removeFilter()
    }
  }

  componentWillReceiveProps (nextProps) {
    this.syncWithAppState(nextProps)
  }

  componentWillMount () {
    this.syncWithAppState(this.props, true)
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  toggleEnabled = () => {
    this.setState({isEnabled: !this.state.isEnabled},
      () => { this.modifySliver(this.state.field, this.state.isMissing) })
  }

  modifySliver = (field, isMissing) => {
    const widget = createExistsWidget(field, null, isMissing)
    widget.id = this.props.id
    widget.isEnabled = this.state.isEnabled
    this.props.actions.modifyRacetrackWidget(widget)
  }

  toggleMissing = (event) => {
    const isMissing = !event.target.checked
    this.setState({ isMissing })
    this.modifySliver(this.state.field, isMissing)
  }

  render () {
    const { isIconified } = this.props
    const { field, isEnabled } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))
    return (
      <Widget className='Exists'
              title={ExistsWidgetInfo.title}
              field={title}
              backgroundColor={ExistsWidgetInfo.color}
              isEnabled={isEnabled}
              enableToggleFn={this.toggleEnabled}
              isIconified={isIconified}
              icon={ExistsWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="Exists-body">
          <div className="Exists-exists">
            <div className="Exists-missing-label">missing</div>
            <Toggle checked={!this.state.isMissing} onChange={this.toggleMissing} />
            <div className="Exists-exists-label">exists</div>
          </div>
        </div>
      </Widget>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Exists)
