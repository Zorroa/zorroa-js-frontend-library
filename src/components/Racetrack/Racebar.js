import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'

import User from '../../models/User'
import Widget, { removeRaw } from '../../models/Widget'
import Folder from '../../models/Folder'
import AssetSearch from '../../models/AssetSearch'
import TrashedFolder from '../../models/TrashedFolder'
import * as WidgetInfo from './WidgetInfo'
import Searcher from './Searcher'
import Searchbar from '../Searchbar'
import QuickAddWidget from './QuickAddWidget'
import CreateFolder from '../Folders/CreateFolder'
import { showModal, toggleCollapsible, dialogAlertPromise } from '../../actions/appActions'
import { unorderAssets } from '../../actions/assetsAction'
import { createFolder, selectFolderIds, createDyHiFolder } from '../../actions/folderAction'
import { resetRacetrackWidgets, similar } from '../../actions/racetrackAction'
import { saveSharedLink } from '../../actions/sharedLinkAction'
import { LOAD_SEARCH_ITEM } from '../../constants/localStorageItems'

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
      ofsIds: PropTypes.arrayOf(PropTypes.string)
    }),
    query: PropTypes.instanceOf(AssetSearch),
    user: PropTypes.instanceOf(User).isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    openId: -1,
    sharedLink: null,
    copyingLink: false
  }

  lastWidgetCount = -1

  componentWillReceiveProps (nextProps) {
    const { widgets, similar, order, selectedFolderIds, trashedFolders } = nextProps
    const isOpenPinned = widgets.findIndex(widget => widget.id === this.state.openId && widget.isPinned) >= 0
    if (isOpenPinned) {
      this.setState({openId: -1})
    }
    if (widgets && widgets.length !== this.lastWidgetCount) {
      if (widgets.length === this.lastWidgetCount + 1) {
        // Only open the widget if we've added a single new widget without a search
        const widget = widgets.length && widgets[widgets.length - 1]
        let openId = widget ? widget.id : -1
        if (widget.type === WidgetInfo.SimilarHashWidgetInfo.type) {
          if (similar.values && similar.values.length) openId = -1
        } else if (widget.type === WidgetInfo.SortOrderWidgetInfo.type) {
          if (order && order.length) openId = -1
        } else if (widget.type === WidgetInfo.CollectionsWidgetInfo.type) {
          const nonTrashedFolderIds = Searcher.nonTrashedFolderIds(selectedFolderIds, trashedFolders)
          if (nonTrashedFolderIds && nonTrashedFolderIds.length) openId = -1
        } else {
          if (widget.sliver && !widget.sliver.empty()) openId = -1
        }
        this.setState({openId})
      }
      this.lastWidgetCount = widgets.length
    }
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
        const field = widget.field
        dyhiLevels.push({ field, type: 'Attr' })
      }
    })
    const width = '400px'
    const body = <CreateFolder title='Create Smart Collection' acl={[]}
                               includeAssets={false}
                               dyhiLevels={dyhiLevels}
                               onCreate={this.saveSearch}/>
    this.props.actions.showModal({body, width})
  }

  saveSearch = (name, acl, dyhiLevels) => {
    const { widgets, selectedFolderIds, trashedFolders, order, similar, user } = this.props
    const parentId = user && user.homeFolderId
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
      const hasSimilar = widgets.findIndex(widget => widget.type === WidgetInfo.SimilarHashWidgetInfo.type) >= 0
      const hasOrder = widgets.findIndex(widget => widget.type === WidgetInfo.SortOrderWidgetInfo.type) >= 0
      const attrs = { widgets, similar: hasSimilar ? similar : undefined, order: hasOrder ? order : undefined }
      const folder = new Folder({ name, acl, parentId, search, attrs })
      this.props.actions.createFolder(folder)
      this.props.actions.toggleCollapsible('home', true)
    }
  }

  clearRacetrack = () => {
    this.props.actions.selectFolderIds()
    this.props.actions.similar()
    this.props.actions.unorderAssets()
    this.props.actions.resetRacetrackWidgets()
  }

  shareSearch = () => {
    const { query, similar, order, widgets, actions } = this.props
    const attrs = { similar, widgets, order }

    actions.saveSharedLink({folder: { search: query, attrs }})
    .then(id => {
      this.setState({ sharedLink: `${location.origin}/?${LOAD_SEARCH_ITEM}=${id}` })
    })
    .catch(err => {
      actions.dialogAlertPromise('Save Search Error', 'Something went wrong saving this search. Check console for errors.')
      return Promise.reject(err)
    })
  }

  copySearch = () => {
    copy(this.state.sharedLink)
    this.setState({ sharedLink: null, copyingLink: true })
    clearTimeout(this.copyTimeout)
    this.copyTimeout = setTimeout(() => { this.setState({ copyingLink: false }) }, 2000)
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
    const { sharedLink, copyingLink } = this.state
    const { widgets, hoverFields, order, similar } = this.props
    const blacklist = [WidgetInfo.SimpleSearchWidgetInfo.type]
    const disabled = !(widgets && widgets.length) && !(order && order.length) &&
      !(similar && similar.field && similar.values && similar.values.length)
    return (
      <div className="Racebar">
        <Searcher/>
        <div className="Racebar-wrap">
          <div className="Racebar-searchbar">
            <Searchbar/>
          </div>
          { widgets && widgets.length > 0 && widgets.filter(w => (blacklist.indexOf(w.type) < 0)).map((widget, i) => (
            <div key={widget.id}
                 className={classnames('Racebar-widget', {hoverField: hoverFields.has(removeRaw(widget.field))})} >
              { this.renderWidget(widget, false) }
            </div>
          ))}
          <QuickAddWidget/>
        </div>
        <div className="Racebar-right">
          <div className={classnames('Racebar-save', {disabled})}
               onClick={!disabled && this.saveRacetrack} title="Save the search">
            Save
          </div>
          <div className={classnames('Racebar-share', 'icon-external', {disabled})}
               onClick={this.shareSearch} title="Share search link"/>
          { sharedLink && (
            <div className='Racebar-share-copy' onClick={this.copySearch}>
              <div className='Racebar-share-copy-anchor'/>
              Search saved. Click to copy.
            </div>)
          }
          { copyingLink && <div className="Racebar-performed-action">Copied URL to clipboard</div> }
          <div className={classnames('Racebar-clear', {disabled})}
               onClick={!disabled && this.clearRacetrack} title="Clear the search">
            Clear
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  widgets: state.racetrack.widgets,
  hoverFields: state.app.hoverFields,
  isolatedId: state.assets.isolatedId,
  order: state.assets.order,
  query: state.assets.query,
  selectedFolderIds: state.folders.selectedFolderIds,
  trashedFolders: state.folders.trashedFolders,
  similar: state.racetrack.similar,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({
    resetRacetrackWidgets,
    createFolder,
    createDyHiFolder,
    similar,
    unorderAssets,
    selectFolderIds,
    showModal,
    toggleCollapsible,
    saveSharedLink,
    dialogAlertPromise
  }, dispatch)
}))(Racebar)
