import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Widget from '../../models/Widget'
import Folder from '../../models/Folder'
import TrashedFolder from '../../models/TrashedFolder'
import * as WidgetInfo from './WidgetInfo'
import Searcher from './Searcher'
import Searchbar from '../Searchbar'
import AddWidget from './AddWidget'
import CreateFolder from '../Folders/CreateFolder'
import { showModal } from '../../actions/appActions'
import { unorderAssets } from '../../actions/assetsAction'
import { createFolder, selectFolderIds, createDyHiFolder } from '../../actions/folderAction'
import { resetRacetrackWidgets, similar } from '../../actions/racetrackAction'
import homeIcon from './home-icon.svg'

class Racebar extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    hoverFields: PropTypes.instanceOf(Set),
    isolatedId: PropTypes.string,
    folderCounts: PropTypes.instanceOf(Map),
    selectedFolderIds: PropTypes.object,
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    order: PropTypes.arrayOf(PropTypes.object),
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string),
      assetIds: PropTypes.arrayOf(PropTypes.string)
    }),
    libraryId: PropTypes.number,
    user: PropTypes.instanceOf(User).isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    openId: -1
  }

  lastWidgetCount = -1

  componentWillReceiveProps (nextProps) {
    const { widgets } = nextProps
    const isOpenPinned = widgets.findIndex(widget => widget.id === this.state.openId && widget.isPinned) >= 0
    if (isOpenPinned) {
      this.setState({openId: -1})
    }
    if (widgets && widgets.length !== this.lastWidgetCount) {
      this.lastWidgetCount = widgets.length
      if (widgets.length === this.lastWidgetCount + 1) {
        // Only open the widget if we've added a single new widget
        const openId = widgets.length ? widgets[widgets.length - 1].id : -1
        this.setState({openId})
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
    const { widgets } = this.props
    const dyhiLevels = []
    widgets.forEach(widget => {
      if (widget.type === WidgetInfo.FacetWidgetInfo.type) {
        const field = widget.sliver.aggs.facet.terms.field
        dyhiLevels.push({ field, type: 'Attr' })
      }
    })
    const width = '400px'
    const body = <CreateFolder title='Create Smart Collection' acl={[]}
                               includeAssets={false}
                               dyhiLevels={dyhiLevels} widgetLayout={true}
                               onCreate={this.saveSearch}/>
    this.props.actions.showModal({body, width})
  }

  saveSearch = (name, acl, dyhiLevels) => {
    const { widgets, selectedFolderIds, trashedFolders, order, similar, user, libraryId } = this.props
    const parentId = dyhiLevels && dyhiLevels.length ? libraryId : (user ? user.homeFolderId : Folder.ROOT_ID)
    const nonTrashedFolderIds = Searcher.nonTrashedFolderIds(selectedFolderIds, trashedFolders)
    const search = Searcher.build(widgets, nonTrashedFolderIds, order, similar)
    const saveSearch = dyhiLevels && typeof dyhiLevels === 'string' && dyhiLevels === 'Search'
    const saveLayout = dyhiLevels && typeof dyhiLevels === 'string' && dyhiLevels === 'Layout'
    if (!saveLayout && !saveSearch && dyhiLevels && dyhiLevels.length) {
      if (search.filter && search.filter.terms) {
        dyhiLevels.forEach(dyhi => { search.filter.terms[dyhi.field] = undefined })
      }
      const folder = new Folder({ name, acl, parentId, search })
      this.props.actions.createDyHiFolder(folder, dyhiLevels)
    } else {
      if (saveLayout) {                 // Just save aggs
        search.query = undefined
        search.filter = undefined
        search.postFilter = undefined
        search.order = []
      }
      const folder = new Folder({ name, acl, parentId, search })
      this.props.actions.createFolder(folder)
    }
  }

  clearRacetrack = () => {
    this.props.actions.selectFolderIds()
    this.props.actions.similar()
    this.props.actions.unorderAssets()
    this.props.actions.resetRacetrackWidgets()
  }

  renderWidget (widget, isIconified) {
    const widgetInfo = Object.keys(WidgetInfo)
      .map(k => WidgetInfo[k])
      .find(widgetInfo => (widgetInfo.type === widget.type))
    if (!widgetInfo.element) return
    const isPinned = false
    const isEnabled = widget.isEnabled
    const isOpen = !this.props.isolatedId && this.state.openId === widget.id
    const onOpen = _ => this.toggleOpen(widget)
    const floatBody = true
    const maxWidth = 360
    return cloneElement(widgetInfo.element, {id: widget.id, isIconified, isPinned, isEnabled, isOpen, onOpen, maxWidth, floatBody})
  }

  render () {
    const { widgets, hoverFields, order, similar } = this.props
    const disabled = !(widgets && widgets.length) && !(order && order.length) &&
      !(similar && similar.field && similar.values && similar.values.length)
    return (
      <div className="Racebar">
        <Searcher/>
        <div className={classnames('Racebar-clear', {disabled})}
             onClick={this.clearRacetrack} title="Clear the search">
          Clear
          <img className="Racebar-clear-icon" src={homeIcon}/>
        </div>
        <div className={classnames('Racebar-save', {disabled})}
             onClick={this.saveRacetrack} title="Save the search">
          Save
          <div className="icon-folder-add"/>
        </div>
        <div className="Racebar-searchbar">
          <Searchbar/>
        </div>
        { widgets && widgets.length > 0 && widgets.map((widget, i) => (
          <div key={widget.id}
               className={classnames('Racebar-widget', {hoverField: hoverFields.has(widget.field())})} >
            { this.renderWidget(widget, false) }
          </div>
        ))}
        <div onClick={this.showAddWidget} className="Racebar-add-widget icon-plus" title="Add a search widget"/>
      </div>
    )
  }
}

export default connect(state => ({
  widgets: state.racetrack.widgets,
  hoverFields: state.app.hoverFields,
  isolatedId: state.assets.isolatedId,
  order: state.assets.order,
  selectedFolderIds: state.folders.selectedFolderIds,
  trashedFolders: state.folders.trashedFolders,
  similar: state.racetrack.similar,
  libraryId: state.folders.libraryId,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    resetRacetrackWidgets,
    createFolder,
    createDyHiFolder,
    similar,
    unorderAssets,
    selectFolderIds,
    showModal
  }, dispatch)
}))(Racebar)
