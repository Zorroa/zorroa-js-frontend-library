import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import PanZoom from './PanZoom'
import Controlbar from './Controlbar'
import Thumbs from './Thumbs'
import Asset from '../../models/Asset'
import { setThumbSize } from '../../actions/appActions'
import { isolateAssetId } from '../../actions/assetsAction'

const MIN_THUMBSIZE = 48
const MAX_THUMBSIZE = 480
const DELTA_THUMBSIZE = 48

class Image extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    thumbSize: PropTypes.number.isRequired,
    showMultipage: PropTypes.bool,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    actions: PropTypes.object.isRequired
  }

  state = {
    multipage: this.props.showMultipage
  }

  zoomIn = (event) => {
    let { thumbSize } = this.props
    thumbSize = Math.min(MAX_THUMBSIZE, thumbSize + DELTA_THUMBSIZE)
    this.props.actions.setThumbSize(thumbSize)
  }

  zoomOut = (event) => {
    let { thumbSize } = this.props
    thumbSize = Math.max(MIN_THUMBSIZE, thumbSize - DELTA_THUMBSIZE)
    this.props.actions.setThumbSize(thumbSize)
  }

  switchToPanZoom = (asset, event) => {
    if (asset) this.props.actions.isolateAssetId(asset.id)
    this.setState({multipage: false})
  }

  switchToMultipage = (event) => {
    this.setState({multipage: true})
  }

  render () {
    const { url, thumbSize, assets } = this.props
    const { multipage } = this.state
    if (multipage) {
      const zoomOutDisabled = thumbSize < MIN_THUMBSIZE
      const zoomInDisabled = thumbSize > MAX_THUMBSIZE
      return (
        <div className="Image-frame">
          <Thumbs assets={assets} onMonopage={this.switchToPanZoom}/>
          <Controlbar onZoomIn={!zoomInDisabled && this.zoomIn}
                      onZoomOut={!zoomOutDisabled && this.zoomOut}
                      onMonopage={e => this.switchToPanZoom(null, e)} />
        </div>
      )
    }

    return (
      <div className="Image-frame">
        <PanZoom onMultipage={assets && assets.length > 1 && this.switchToMultipage}>
          <div className="Image" style={{ backgroundSize: 'fit', backgroundImage: `url(${url})` }} />
        </PanZoom>
      </div>
    )
  }
}

export default connect(state => ({
  thumbSize: state.app.thumbSize,
  showMultipage: state.app.showMultipage
}), dispatch => ({
  actions: bindActionCreators({
    setThumbSize,
    isolateAssetId
  }, dispatch)
}))(Image)
