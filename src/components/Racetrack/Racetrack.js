import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Searcher from './Searcher'
import QuickAddWidget from './QuickAddWidget'
import Widget from '../../models/Widget'
import * as WidgetInfo from './WidgetInfo'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { createFolder } from '../../actions/folderAction'
import { showCreateFolderModal } from '../../actions/appActions'

class Racetrack extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    query: PropTypes.instanceOf(AssetSearch),
    actions: PropTypes.object.isRequired,
    isIconified: PropTypes.bool.isRequired
  }

  state = {
    emptySearch: ''
  }

  saveRacetrack = () => {
    const acl = []
    this.props.actions.showCreateFolderModal('Create Smart Collection', acl, this.saveSearch)
  }

  saveSearch = (name, acl) => {
    const { query } = this.props
    const parentId = Folder.ROOT_ID     // FIXME: Private folders under <user>
    const search = new AssetSearch(query)
    search.aggs = undefined             // Remove widget aggs
    const folder = new Folder({ name, acl, parentId, search })
    this.props.actions.createFolder(folder)
  }

  clearRacetrack = () => {
    this.props.actions.resetRacetrackWidgets()
  }

  submitEmptySearch = (event) => {
    event.preventDefault()
    const type = WidgetInfo.SimpleSearchWidgetInfo.type
    const sliver = new AssetSearch({ query: this.state.emptySearch })
    this.props.actions.resetRacetrackWidgets([new Widget({ type, sliver })])
  }

  changeEmptySearch = (event) => {
    this.setState({ emptySearch: event.target.value })
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

  renderWidget (widget, isIconified) {
    const widgetInfo = Object.keys(WidgetInfo)
      .map(k => WidgetInfo[k])
      .find(widgetInfo => (widgetInfo.type === widget.type))
    return cloneElement(widgetInfo.element, {id: widget.id, isIconified})
  }

  renderFooter (isIconified) {
    if (isIconified) return null
    const { widgets } = this.props
    const disabled = !widgets || !widgets.length
    return (
      <div className="Racetrack-footer flexOff">
        <div className="Racetrack-footer-group">
          <button disabled={disabled} onClick={this.saveRacetrack} className="Racetrack-footer-save-button">Save</button>
          <button disabled={disabled} onClick={this.clearRacetrack}>Clear</button>
        </div>
      </div>
    )
  }

  renderAddWidgets (isIconified) {
    if (isIconified) return null
    return (
      <div className="Racetrack-add-filter">
        <div className='Racetrack-add-widget flexRow flexAlignItemsCenter'><i className='icon-plus2'/>Add Widget</div>
        <QuickAddWidget/>
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
  actions: bindActionCreators({
    resetRacetrackWidgets,
    createFolder,
    showCreateFolderModal
  }, dispatch)
})

const mapStateToProps = state => ({
  widgets: state.racetrack.widgets,
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Racetrack)
