import PropTypes from 'prop-types'
import React, { Component, cloneElement } from 'react'
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
import {
  showModal,
  toggleCollapsible,
  dialogAlertPromise,
} from '../../actions/appActions'
import { unorderAssets, isolateParent } from '../../actions/assetsAction'
import {
  createFolder,
  selectFolderIds,
  createDyHiFolder,
} from '../../actions/folderAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { saveSharedLink } from '../../actions/sharedLinkAction'
import { selectJobIds } from '../../actions/jobActions'
import { LOAD_SEARCH_ITEM } from '../../constants/localStorageItems'
import elements from './elements'

class Racebar extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    hoverFields: PropTypes.instanceOf(Set),
    isolatedId: PropTypes.string,
    selectedFolderIds: PropTypes.object,
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    selectedJobIds: PropTypes.instanceOf(Set),
    order: PropTypes.arrayOf(PropTypes.object),
    query: PropTypes.instanceOf(AssetSearch),
    user: PropTypes.instanceOf(User).isRequired,
    actions: PropTypes.object.isRequired,
  }

  state = {
    openId: -1,
    sharedLink: null,
    copyingLink: false,
  }

  lastWidgetCount = -1

  componentWillReceiveProps(nextProps) {
    const { widgets, order, selectedFolderIds, trashedFolders } = nextProps
    const isOpenPinned =
      widgets.findIndex(
        widget => widget.id === this.state.openId && widget.isPinned,
      ) >= 0
    if (isOpenPinned) {
      this.setState({ openId: -1 })
    }
    if (widgets && widgets.length !== this.lastWidgetCount) {
      if (widgets.length === this.lastWidgetCount + 1) {
        // Only open the widget if we've added a single new widget without a search
        const widget = widgets.length && widgets[widgets.length - 1]
        let openId = widget ? widget.id : -1
        if (widget.type === WidgetInfo.SortOrderWidgetInfo.type) {
          if (order && order.length) openId = -1
        } else if (widget.type === WidgetInfo.CollectionsWidgetInfo.type) {
          const nonTrashedFolderIds = Searcher.nonTrashedFolderIds(
            selectedFolderIds,
            trashedFolders,
          )
          if (nonTrashedFolderIds && nonTrashedFolderIds.length) openId = -1
        } else {
          if (widget.sliver && !widget.sliver.empty()) openId = -1
        }
        this.setState({ openId })
      }
      this.lastWidgetCount = widgets.length
    }
  }

  toggleOpen = (widget, isOpen) => {
    this.setState({ openId: isOpen ? widget.id : -1 })
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
    const body = (
      <CreateFolder
        title="Create Smart Collection"
        acl={[]}
        includeAssets={false}
        includePermissions={false}
        dyhiLevels={dyhiLevels}
        name=""
        onCreate={this.saveSearch}
      />
    )
    this.props.actions.showModal({ body, width })
  }

  saveSearch = (name, acl, dyhiLevels) => {
    const {
      widgets,
      selectedFolderIds,
      trashedFolders,
      selectedJobIds,
      order,
      user,
    } = this.props
    const parentId = user && user.homeFolderId
    const nonTrashedFolderIds = Searcher.nonTrashedFolderIds(
      selectedFolderIds,
      trashedFolders,
    )
    const search = Searcher.build(
      widgets,
      nonTrashedFolderIds,
      selectedJobIds,
      order,
    )
    const saveSearch =
      dyhiLevels && typeof dyhiLevels === 'string' && dyhiLevels === 'Search'
    const saveLayout =
      dyhiLevels && typeof dyhiLevels === 'string' && dyhiLevels === 'Layout'
    const saveLaunchpad =
      dyhiLevels && typeof dyhiLevels === 'string' && dyhiLevels === 'Launchpad'
    if (
      !saveLayout &&
      !saveSearch &&
      !saveLaunchpad &&
      dyhiLevels &&
      dyhiLevels.length
    ) {
      if (search.filter && search.filter.terms) {
        dyhiLevels.forEach(dyhi => {
          search.filter.terms[dyhi.field] = undefined
        })
      }
      const folder = new Folder({ name, acl, parentId, search })
      this.props.actions.createDyHiFolder(folder, dyhiLevels)
    } else {
      if (saveLayout) {
        // Just save aggs
        search.query = undefined
        search.filter = undefined
        search.postFilter = undefined
        search.order = []
      }
      const hasOrder =
        widgets.findIndex(
          widget => widget.type === WidgetInfo.SortOrderWidgetInfo.type,
        ) >= 0
      const attrs = {
        widgets,
        order: hasOrder ? order : undefined,
        launchpad: saveLaunchpad,
      }
      const folder = new Folder({ name, acl, parentId, search, attrs })
      this.props.actions.createFolder(folder)
      this.props.actions.toggleCollapsible('home', true)
    }
  }

  clearRacetrack = () => {
    this.props.actions.resetRacetrackWidgets()
    this.props.actions.selectFolderIds()
    this.props.actions.unorderAssets()
    this.props.actions.selectJobIds()
    this.props.actions.isolateParent()
  }

  shareSearch = () => {
    const { query, order, widgets, actions } = this.props
    const attrs = { widgets, order }

    actions
      .saveSharedLink({ folder: { search: query, attrs } })
      .then(id => {
        this.setState({
          sharedLink: `${location.origin}/?${LOAD_SEARCH_ITEM}=${id}`,
        })
      })
      .catch(err => {
        actions.dialogAlertPromise(
          'Save Search Error',
          'Something went wrong saving this search. Check console for errors.',
        )
        return Promise.reject(err)
      })
  }

  copySearch = () => {
    copy(this.state.sharedLink)
    this.setState({ sharedLink: null, copyingLink: true })
    clearTimeout(this.copyTimeout)
    this.copyTimeout = setTimeout(() => {
      this.setState({ copyingLink: false })
    }, 2000)
  }

  renderWidget(widget, isIconified) {
    const widgetInfo =
      Object.keys(WidgetInfo)
        .map(k => WidgetInfo[k])
        .find(widgetInfo => widgetInfo.type === widget.type) || {}
    const element = elements[widgetInfo.type]
    if (!element) return
    const isPinned = widget.isPinned === true
    const isEnabled = widget.isEnabled
    const isOpen = !this.props.isolatedId && this.state.openId === widget.id
    const onOpen = e => this.toggleOpen(widget, e)
    const floatBody = true
    const maxWidth = 360
    return cloneElement(element, {
      id: widget.id,
      isIconified,
      isPinned,
      isEnabled,
      isOpen,
      onOpen,
      maxWidth,
      floatBody,
    })
  }

  render() {
    const { sharedLink, copyingLink } = this.state
    const { widgets, hoverFields, order } = this.props
    const blacklist = [WidgetInfo.SimpleSearchWidgetInfo.type]
    const disabled = !(widgets && widgets.length) && !(order && order.length)
    return (
      <div className="Racebar">
        <Searcher />
        <div className="Racebar-left">
          <div className="Racebar-searchbar">
            <Searchbar />
          </div>
        </div>
        <div className="Racebar-wrap">
          {widgets &&
            widgets.length > 0 &&
            widgets.filter(w => blacklist.indexOf(w.type) < 0).map(widget => (
              <div
                key={widget.id}
                className={classnames('Racebar-widget', {
                  hoverField: hoverFields.has(removeRaw(widget.field)),
                })}>
                {this.renderWidget(widget, false)}
              </div>
            ))}
          <QuickAddWidget />
        </div>
        <div className="Racebar-right">
          <div
            className={classnames('Racebar-save', { disabled })}
            onClick={!disabled && this.saveRacetrack}
            title="Save the search">
            Save
          </div>
          <div
            className={classnames('Racebar-share', 'icon-external', {
              disabled,
            })}
            onClick={this.shareSearch}
            title="Share search link"
          />
          {sharedLink && (
            <div
              className="Racebar-share-copy"
              onClick={this.copySearch}
              data-link={sharedLink}>
              <div className="Racebar-share-copy-anchor" />
              Search saved. Click to copy.
            </div>
          )}
          {copyingLink && (
            <div className="Racebar-performed-action">
              Copied URL to clipboard
            </div>
          )}
          <div
            className={classnames('Racebar-clear', { disabled })}
            onClick={!disabled && this.clearRacetrack}
            title="Clear the search">
            Clear
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    widgets: state.racetrack.widgets,
    hoverFields: state.app.hoverFields,
    isolatedId: state.assets.isolatedId,
    order: state.assets.order,
    query: state.assets.query,
    selectedJobIds: state.jobs.selectedIds,
    selectedFolderIds: state.folders.selectedFolderIds,
    trashedFolders: state.folders.trashedFolders,
    user: state.auth.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        resetRacetrackWidgets,
        createFolder,
        createDyHiFolder,
        unorderAssets,
        isolateParent,
        selectFolderIds,
        selectJobIds,
        showModal,
        toggleCollapsible,
        saveSharedLink,
        dialogAlertPromise,
      },
      dispatch,
    ),
  }),
)(Racebar)
