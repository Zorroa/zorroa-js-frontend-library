import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Searcher from './Searcher'
import SimpleSearch, { SimpleSearchHeader } from './SimpleSearch'
import Facet, { FacetHeader } from './Facet'
import DropdownMenu from '../DropdownMenu'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import { resetRacetrackWidgets, modifyRacetrackWidget } from '../../actions/racetrackAction'
import * as widgetTypes from '../../constants/widgetTypes'

class Racetrack extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    actions: PropTypes.object.isRequired
  }

  state = {
    emptySearch: ''
  }

  handleSave () {
    console.log(`Save racetrack with ${this.state.filters.length} filters`)
  }

  handleClear () {
    this.props.actions.resetRacetrackWidgets()
  }

  handleQuickAddKeyPress () {
    console.log('Quick Add keypress')
  }

  submitEmptySearch (event) {
    event.preventDefault()
    const type = widgetTypes.SIMPLE_SEARCH_WIDGET
    const sliver = new AssetSearch({ query: this.state.emptySearch })
    this.props.actions.resetRacetrackWidgets([new Widget({ type, sliver })])
  }

  changeEmptySearch (event) {
    this.setState({ emptySearch: event.target.value })
  }

  pushWidgetType (type) {
    this.props.actions.modifyRacetrackWidget(new Widget({type}))
  }

  renderEmpty () {
    return (
      <div className="racetrack-empty">
        <div className="racetrack-empty-mag icon-search" />
        <div className="racetrack-empty-text">
          GET STARTED WITH A SIMPLE SEARCH<br/>
          OR ADD SEARCH WIDGETS
        </div>
        <form onSubmit={this.submitEmptySearch.bind(this)}>
          <input type="text" placeholder="Search..."
                 value={this.state.emptySearch}
                 onChange={this.changeEmptySearch.bind(this)} />
        </form>
      </div>
    )
  }

  renderWidgetTypeHeader (widgetType) {
    switch (widgetType) {
      case widgetTypes.SIMPLE_SEARCH_WIDGET:
        return <SimpleSearchHeader/>
      case widgetTypes.FACET_WIDGET:
        return <FacetHeader field="Keyword"/>
      default:
        return <div/>
    }
  }

  renderWidget (widget) {
    switch (widget.type) {
      case widgetTypes.SIMPLE_SEARCH_WIDGET:
        return <SimpleSearch id={widget.id}/>
      case widgetTypes.FACET_WIDGET:
        return <Facet id={widget.id}/>
      default:
        return <div/>
    }
  }

  render () {
    const { widgets } = this.props
    return (
      <div className="racetrack">
        <Searcher/>
        <div className="racetrack-body">
          { (!widgets || widgets.length === 0) && this.renderEmpty() }
          { widgets && widgets.length > 0 && (
          <div className="racetrack-filters">
            {widgets.map((widget, i) => (
              <div key={i} className="racetrack-widget">
                { this.renderWidget(widget) }
              </div>
            ))}
          </div>
          )}
          <div className="racetrack-add-filter">
            <DropdownMenu label="+ ADD WIDGET">
              { Object.values(widgetTypes).map(widgetType => (
                <div className="racetrack-add-filter-item" key={widgetType} onClick={this.pushWidgetType.bind(this, widgetType)}>
                  { this.renderWidgetTypeHeader(widgetType) }
                </div>
              ))}
            </DropdownMenu>
            <input onKeyPress={this.handleQuickAddKeyPress.bind(this)} placeholder="Quick Add - Widget"/>
          </div>
        </div>
        <div className="racetrack-footer">
          <div className="racetrack-footer-group">
            <button onClick={this.handleSave.bind(this)} className="racetrack-footer-save-button">Save</button>
            <button onClick={this.handleClear.bind(this)}>Clear</button>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, resetRacetrackWidgets }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query,
  widgets: state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Racetrack)
