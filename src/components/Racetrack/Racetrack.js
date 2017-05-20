import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Searcher from './Searcher'
import AddWidget from './AddWidget'
import QuickAddWidget from './QuickAddWidget'
import CreateFolder from '../Folders/CreateFolder'
import Widget, { createSearchWidget } from '../../models/Widget'
import * as WidgetInfo from './WidgetInfo'
import User from '../../models/User'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { createFolder } from '../../actions/folderAction'
import { showModal } from '../../actions/appActions'

class Racetrack extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    query: PropTypes.instanceOf(AssetSearch),
    actions: PropTypes.object.isRequired,
    isIconified: PropTypes.bool.isRequired,
    hoverFields: PropTypes.instanceOf(Set),
    user: PropTypes.instanceOf(User).isRequired
  }

  state = {
    emptySearch: ''
  }

  saveRacetrack = () => {
    const width = '300px'
    const body = <CreateFolder title='Create Smart Collection' acl={[]}
                               onCreate={this.saveSearch}/>
    this.props.actions.showModal({body, width})
  }

  saveSearch = (name, acl) => {
    const { query, user } = this.props
    const parentId = user ? user.homeFolderId : Folder.ROOT_ID
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
    const widget = createSearchWidget('', null, this.state.emptySearch, false)
    this.props.actions.resetRacetrackWidgets([widget])
  }

  changeEmptySearch = (event) => {
    this.setState({ emptySearch: event.target.value })
  }

  showAddWidget = (event) => {
    const width = '732px'   // Exactly fits three widgets across
    const body = <AddWidget/>
    this.props.actions.showModal({body, width})
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
    const { query } = this.props
    const disabled = !query || query.empty()
    return (
      <div className="Racetrack-footer flexOff">
        <div className="Racetrack-footer-group">
          <button disabled={disabled} onClick={this.saveRacetrack} className="Racetrack-footer-save">Save</button>
          <button disabled={disabled} onClick={this.clearRacetrack} className="Racetrack-footer-clear">Clear</button>
        </div>
      </div>
    )
  }

  renderAddWidgets (isIconified) {
    if (isIconified) return null
    return (
      <div className="Racetrack-add-filter">
        <div onClick={this.showAddWidget} className='Racetrack-add-widget'><i className='icon-plus'/>Add Widget</div>
        <QuickAddWidget/>
      </div>
    )
  }

  render () {
    const { widgets, isIconified, hoverFields } = this.props
    return (
      <div className="Racetrack flexCol fullHeight">
        <Searcher/>
        <div className="Racetrack-body flexOff flexCol">
          { (!widgets || widgets.length === 0) && this.renderEmpty(isIconified) }
          { widgets && widgets.length > 0 && (
          <div className="Racetrack-filters">
            {widgets.map((widget, i) => (
              <div key={widget.id}
                   className={classnames('Racetrack-widget', {hoverField: hoverFields.has(widget.field())})} >
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
    showModal
  }, dispatch)
})

const mapStateToProps = state => ({
  widgets: state.racetrack.widgets,
  query: state.assets.query,
  hoverFields: state.app.hoverFields,
  user: state.auth.user
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Racetrack)
