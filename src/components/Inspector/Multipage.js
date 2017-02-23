import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Controlbar from './Controlbar'
import Thumbs from './Thumbs'
import Asset from '../../models/Asset'
import { showPages, setThumbSize, MIN_THUMBSIZE, MAX_THUMBSIZE, DELTA_THUMBSIZE, DEFAULT_THUMBSIZE } from '../../actions/appActions'
import { isolateAssetId } from '../../actions/assetsAction'

class Multipage extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)).isRequired,
    showMultipage: PropTypes.bool,
    showPages: PropTypes.bool,
    thumbSize: PropTypes.number,
    actions: PropTypes.object,
    children: PropTypes.node.isRequired
  }

  static defaultProps = {
    thumbSize: DEFAULT_THUMBSIZE
  }

  componentWillMount () {
    const { showMultipage, assets } = this.props
    if (showMultipage && assets && assets.length) {
      this.props.actions.showPages(true)
    }
  }

  componentWill
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

  switchToMultipage = () => {
    this.props.actions.showPages(true)
  }

  render () {
    const { showPages } = this.props
    if (showPages) {
      const { assets, thumbSize } = this.props
      const zoomOutDisabled = thumbSize < MIN_THUMBSIZE
      const zoomInDisabled = thumbSize > MAX_THUMBSIZE
      return (
        <div className="Multipage">
          <Thumbs assets={assets} onMonopage={this.switchToPanZoom}/>
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
  showPages: state.app.showPages
}), dispatch => ({
  actions: bindActionCreators({
    setThumbSize,
    showPages,
    isolateAssetId
  }, dispatch)
}))(Multipage)
