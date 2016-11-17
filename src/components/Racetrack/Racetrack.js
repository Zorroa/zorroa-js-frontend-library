import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Searcher from './Searcher'
import SimpleSearch from './SimpleSearch'
import Facet from './Facet'
import Map from './Map'
import DropdownMenu from '../DropdownMenu'
import Widget from '../../models/Widget'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import CreateFolder from '../Folders/CreateFolder'
import { resetRacetrackWidgets, modifyRacetrackWidget } from '../../actions/racetrackAction'
import { createFolder } from '../../actions/folderAction'
import * as widgetTypes from '../../constants/widgetTypes'

class Racetrack extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    query: PropTypes.instanceOf(AssetSearch),
    actions: PropTypes.object.isRequired,
    isIconified: PropTypes.bool.isRequired
  }

  state = {
    emptySearch: '',
    showSaveSearch: false
  }

  saveRacetrack = () => {
    this.setState({ ...this.state, showSaveSearch: true })
  }

  dismissSaveSearch = () => {
    this.setState({ ...this.state, showSaveSearch: false })
  }

  saveSearch = (name, acl) => {
    const { query } = this.props
    const parentId = Folder.ROOT_ID     // FIXME: Private folders under <user>
    const search = new AssetSearch(query)
    search.aggs = undefined             // Remove widget aggs
    const folder = new Folder({ name, acl, parentId, search: query })
    this.props.actions.createFolder(folder)
    this.dismissSaveSearch()
  }

  clearRacetrack = () => {
    this.props.actions.resetRacetrackWidgets()
  }

  handleQuickAddKeyPress () {
    console.log('Quick Add keypress')
  }

  submitEmptySearch = (event) => {
    event.preventDefault()
    const type = widgetTypes.SIMPLE_SEARCH_WIDGET
    const sliver = new AssetSearch({ query: this.state.emptySearch })
    this.props.actions.resetRacetrackWidgets([new Widget({ type, sliver })])
  }

  changeEmptySearch = (event) => {
    this.setState({ ...this.state, emptySearch: event.target.value })
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
        <form onSubmit={this.submitEmptySearch}>
          <input type="text" placeholder="Search..."
                 value={this.state.emptySearch}
                 onChange={this.changeEmptySearch} />
        </form>
      </div>
    )
  }

  renderWidgetTypeHeader (widgetType, isIconified) {
    const icons = {
      [widgetTypes.SIMPLE_SEARCH_WIDGET]: 'icon-search',
      [widgetTypes.FACET_WIDGET]: 'icon-bar-graph',
      [widgetTypes.MAP_WIDGET]: 'icon-location'
    }
    const names = {
      [widgetTypes.SIMPLE_SEARCH_WIDGET]: 'Simple Search',
      [widgetTypes.FACET_WIDGET]: 'Facet: Keyword',
      [widgetTypes.MAP_WIDGET]: 'Map: Location'
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
      case widgetTypes.MAP_WIDGET:
        return <Map id={widget.id} isIconified={isIconified} />
      default:
        return <div/>
    }
  }

  renderFooter (isIconified) {
    if (isIconified) return null
    const { showSaveSearch } = this.state
    return (
      <div className="Racetrack-footer flexOff">
        <div className="Racetrack-footer-group">
          { showSaveSearch && <CreateFolder title="Create Smart Collection" onDismiss={this.dismissSaveSearch} onCreate={this.saveSearch} />}
          <button onClick={this.saveRacetrack} className="Racetrack-footer-save-button">Save</button>
          <button onClick={this.clearRacetrack}>Clear</button>
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
  actions: bindActionCreators({ modifyRacetrackWidget, resetRacetrackWidgets, createFolder }, dispatch)
})

const mapStateToProps = state => ({
  widgets: state.racetrack.widgets,
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Racetrack)
