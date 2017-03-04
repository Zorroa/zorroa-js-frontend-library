import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Controlbar from './Controlbar'
import Editbar from '../Assets/Editbar'
import Thumbs from './Thumbs'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import { showPages, setThumbSize, MIN_THUMBSIZE, MAX_THUMBSIZE, DELTA_THUMBSIZE, DEFAULT_THUMBSIZE } from '../../actions/appActions'
import { isolateAssetId, searchDocument, selectPageAssetIds } from '../../actions/assetsAction'

class Multipage extends Component {
  static propTypes = {
    parentId: PropTypes.string,
    order: PropTypes.arrayOf(PropTypes.object),
    showMultipage: PropTypes.bool,
    showPages: PropTypes.bool,
    thumbSize: PropTypes.number,
    query: PropTypes.instanceOf(AssetSearch),
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedPageIds: PropTypes.instanceOf(Set),
    actions: PropTypes.object,
    children: PropTypes.node.isRequired
  }

  static defaultProps = {
    thumbSize: DEFAULT_THUMBSIZE
  }

  state = {
    showDocument: true,
    showedPages: this.props.showPages
  }

  componentWillMount () {
    const { showMultipage, parentId } = this.props
    if (showMultipage && parentId && parentId.length) {
      this.props.actions.showPages(true)
    }
    if (parentId) this.showDocument(this.state.showDocument)
  }

  componentWillReceiveProps (nextProps) {
    const { showPages, parentId } = nextProps
    if (showPages != this.state.showedPages) {
      if (parentId) this.showDocument(this.state.showDocument)
      this.setState({showedPages: showPages})
    }
  }

  zoomIn = (event) => {
    let {thumbSize} = this.props
    thumbSize = Math.min(MAX_THUMBSIZE, thumbSize + DELTA_THUMBSIZE)
    this.props.actions.setThumbSize(thumbSize)
  }

  zoomOut = (event) => {
    let {thumbSize} = this.props
    thumbSize = Math.max(MIN_THUMBSIZE, thumbSize - DELTA_THUMBSIZE)
    this.props.actions.setThumbSize(thumbSize)
  }

  switchToPanZoom = (asset) => {
    if (asset) this.props.actions.isolateAssetId(asset.id)
    this.props.actions.showPages(false)
  }

  showDocument = (show) => {
    this.setState({showDocument: show})
    const { query, parentId, order } = this.props
    if (parentId) this.props.actions.searchDocument(show ? null : query, parentId, order)
  }

  canRemovePageFromFolder = () => {
    return true
  }

  removePagesFromFolder = () => {

  }

  deselectAllPages = () => {
    this.props.actions.selectPageAssetIds()
  }

  render () {
    const { showPages, pages, selectedPageIds } = this.props
    if (showPages) {
      const { thumbSize } = this.props
      const zoomOutDisabled = thumbSize < MIN_THUMBSIZE
      const zoomInDisabled = thumbSize > MAX_THUMBSIZE
      const { showDocument } = this.state

      return (
        <div className="Multipage">
          <Editbar selectedAssetIds={selectedPageIds}
                   onDeselectAll={this.deselectAllPages}
                   isRemoveEnabled={this.canRemovePageFromFolder}
                   onRemove={this.removePagesFromFolder}>
            <div className="Multipage-document-switch">
              <div onClick={e => this.showDocument(false)}
                   className={classnames('Multipage-document-mode left', {selected: !showDocument})}>
                Search Results
              </div>
              <div onClick={e => this.showDocument(true)}
                   className={classnames('Multipage-document-mode right', {selected: showDocument})}>
                Full Document
              </div>
            </div>
          </Editbar>
          { pages && <Thumbs assets={pages} onMonopage={this.switchToPanZoom}/> }
          <Controlbar onZoomIn={!zoomInDisabled && this.zoomIn}
                      onZoomOut={!zoomOutDisabled && this.zoomOut}
                      onMonopage={e => this.switchToPanZoom(null, e)}/>
        </div>
      )
    }
    return <div className="Multipage">{this.props.children}</div>
  }
}

export default connect(state => ({
  thumbSize: state.app.thumbSize,
  showMultipage: state.app.showMultipage,
  showPages: state.app.showPages,
  query: state.assets.query,
  pages: state.assets.pages,
  selectedPageIds: state.assets.selectedPageIds
}), dispatch => ({
  actions: bindActionCreators({
    setThumbSize,
    showPages,
    isolateAssetId,
    selectPageAssetIds,
    searchDocument
  }, dispatch)
}))(Multipage)
