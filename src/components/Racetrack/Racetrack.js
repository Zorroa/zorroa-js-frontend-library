import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Searcher from './Searcher'
import SimpleSearch from './SimpleSearch'
import Facet from './Facet'
import DropdownMenu from '../DropdownMenu'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import { resetRacetrackWidgets, modifyRacetrackWidget } from '../../actions/racetrackAction'
import * as widgetTypes from '../../constants/widgetTypes'

class Racetrack extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    actions: PropTypes.object.isRequired,
    isIconified: PropTypes.bool.isRequired
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

  renderEmpty (isIconified) {
    if (isIconified) {
      return <div className="Racetrack-empty-icon-mag icon-search"></div>
    }
    return (
      <div className="Racetrack-empty flexColCenter">
        <div className="Racetrack-empty-mag icon-search" />
        <div className="Racetrack-empty-text">
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

  renderWidgetTypeHeader (widgetType, isIconified) {
    const icons = {
      [widgetTypes.SIMPLE_SEARCH_WIDGET]: 'icon-search',
      [widgetTypes.FACET_WIDGET]: 'icon-bar-graph'
    }
    const names = {
      [widgetTypes.SIMPLE_SEARCH_WIDGET]: 'Simple Search',
      [widgetTypes.FACET_WIDGET]: 'Facet: Keyword'
    }
    return (
      <div className={`Racetrack-add-widget Racetrack-add-${widgetType} flexRow flexAlignItemsCenter`}>
        <i className={`Racetrack-add-icon ${icons[widgetType]}`}></i>
        <span>{names[widgetType]}</span>
      </div>
    )
  }

  renderWidget (widget, isIconified) {
    switch (widget.type) {
      case widgetTypes.SIMPLE_SEARCH_WIDGET:
        return <SimpleSearch id={widget.id} isIconified={isIconified} />
      case widgetTypes.FACET_WIDGET:
        return <Facet id={widget.id} isIconified={isIconified} />
      default:
        return <div/>
    }
  }

  renderFooter (isIconified) {
    if (isIconified) return null
    return (
      <div className="Racetrack-footer flexOff">
        <div className="Racetrack-footer-group">
          <button onClick={this.handleSave.bind(this)} className="Racetrack-footer-save-button">Save</button>
          <button onClick={this.handleClear.bind(this)}>Clear</button>
        </div>
      </div>
    )
  }

  renderAddWidgets (isIconified) {
    if (isIconified) return null
    return (
      <div className="Racetrack-add-filter flexRow flexAlignItemsCenter flexJustifySpaceBetween">
        <DropdownMenu label="+ ADD WIDGET">
          { Object.values(widgetTypes).map(widgetType => (
            <div className="Racetrack-add-filter-item" key={widgetType} onClick={this.pushWidgetType.bind(this, widgetType)}>
              { this.renderWidgetTypeHeader(widgetType, isIconified) }
            </div>
          ))}
        </DropdownMenu>
        <input className='Racetrack-add-quick'
               onKeyPress={this.handleQuickAddKeyPress.bind(this)}
               placeholder="Quick Add - Widget"/>
      </div>
    )
  }

  render () {
    const { widgets, isIconified } = this.props
    return (
      <div className="Racetrack flexCol fullHeight">
        <Searcher/>
        <div className="Racetrack-body flexOff flexCol">
          { (!widgets || widgets.length === 0) && this.renderEmpty(isIconified) }
          { widgets && widgets.length > 0 && (
          <div className="Racetrack-filters">
            {widgets.map((widget, i) => (
              <div key={i} className="Racetrack-widget">
                { this.renderWidget(widget, isIconified) }
              </div>
            ))}
          </div>
          )}
          { this.renderAddWidgets(isIconified) }
        </div>
        <div className='flexOn'/>
        { this.renderFooter(isIconified) }
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
