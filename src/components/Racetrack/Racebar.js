import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Widget from '../../models/Widget'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import * as WidgetInfo from './WidgetInfo'
import Searcher from './Searcher'
import Searchbar from '../Searchbar'
import AddWidget from './AddWidget'
import CreateFolder from '../Folders/CreateFolder'
import { showModal } from '../../actions/appActions'
import { createFolder } from '../../actions/folderAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'

class Racebar extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    query: PropTypes.instanceOf(AssetSearch),
    hoverFields: PropTypes.instanceOf(Set),
    user: PropTypes.instanceOf(User).isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    openId: -1
  }

  lastWidgetCount = -1

  componentWillReceiveProps (nextProps) {
    const { widgets } = nextProps
    if (widgets && widgets.length !== this.lastWidgetCount) {
      this.lastWidgetCount = widgets.length
      if (widgets.length) {
        this.setState({openId: widgets[widgets.length - 1].id})
      } else {
        this.setState({openId: -1})
      }
    }
  }

  showAddWidget = (event) => {
    const width = '732px'   // Exactly fits three widgets across
    const body = <AddWidget/>
    this.props.actions.showModal({body, width})
  }

  toggleOpen = (widget) => {
    const { openId } = this.state
    this.setState({ openId: widget.id === openId ? -1 : widget.id })
  }

  saveRacetrack = () => {
    const width = '300px'
    const body = <CreateFolder title='Create Smart Collection' acl={[]}
                               includeAssets={false}
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

  renderWidget (widget, isIconified) {
    const widgetInfo = Object.keys(WidgetInfo)
      .map(k => WidgetInfo[k])
      .find(widgetInfo => (widgetInfo.type === widget.type))
    if (!widgetInfo.element) return
    const isPinned = false
    const isEnabled = widget.isEnabled
    const isOpen = this.state.openId === widget.id
    const onOpen = _ => this.toggleOpen(widget)
    const floatBody = true
    const maxWidth = 360
    return cloneElement(widgetInfo.element, {id: widget.id, isIconified, isPinned, isEnabled, isOpen, onOpen, maxWidth, floatBody})
  }

  render () {
    const { widgets, hoverFields } = this.props
    console.log('Render Racebar ' + widgets.length)
    return (
      <div className="Racebar">
        <Searcher/>
        <div className="Racebar-clear" onClick={this.clearRacetrack}>
          Clear
          <div className="icon-apartment"/>
        </div>
        <div className="Racebar-save" onClick={this.saveRacetrack}>
          Save
          <div className="icon-folder-add"/>
        </div>
        <div className="Racebar-searchbar">
          <Searchbar/>
        </div>
        { widgets && widgets.length > 0 && widgets.map((widget, i) => (
          <div key={widget.id}
               className={classnames('Racetrack-widget', {hoverField: hoverFields.has(widget.field())})} >
            { this.renderWidget(widget, false) }
          </div>
        ))}
        <div onClick={this.showAddWidget} className="Racebar-add-widget icon-plus"/>
      </div>
    )
  }
}

export default connect(state => ({
  widgets: state.racetrack.widgets,
  hoverFields: state.app.hoverFields,
  query: state.assets.query,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    resetRacetrackWidgets,
    createFolder,
    showModal
  }, dispatch)
}))(Racebar)
