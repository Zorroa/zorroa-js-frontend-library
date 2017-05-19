import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import keydown from 'react-keydown'

import Asset from '../../models/Asset'
import Lightbar from './Lightbar'
import Inspector from '../Inspector'
import Metadata2 from '../Metadata2'
import ResizableWindow from '../ResizableWindow'
import { isolateAssetId } from '../../actions/assetsAction'
import { lightboxMetadata } from '../../actions/appActions'

class Lightbox extends Component {
  static propTypes = {
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string.isRequired,
    lightboxMetadata: PropTypes.shape({
      show: PropTypes.bool.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired
    }),
    actions: PropTypes.object
  }

  @keydown('esc')
  closeLightbox (event) {
    this.props.actions.isolateAssetId()
  }

  @keydown('right')
  nextAsset (event) {
    this.isolateIndexOffset(1)
  }

  @keydown('left')
  previousAsset (event) {
    this.isolateIndexOffset(-1)
  }

  isolateIndexOffset (offset) {
    const { assets, isolatedId, actions } = this.props
    const index = assets.findIndex(asset => (asset.id === isolatedId))
    if (index + offset >= 0 && index + offset < assets.length) {
      actions.isolateAssetId(assets[index + offset].id)
    }
  }

  showMetadata = (event) => {
    const { lightboxMetadata } = this.props
    this.props.actions.lightboxMetadata({ ...lightboxMetadata, show: true })
  }

  closeMetadata = (event) => {
    const { lightboxMetadata } = this.props
    this.props.actions.lightboxMetadata({ ...lightboxMetadata, show: false })
    event.stopPropagation()
  }

  moveMetadata = ({left, top, width, height}) => {
    this.props.actions.lightboxMetadata({ left, top, width, height, show: true })
  }

  render () {
    const { assets, pages, isolatedId, lightboxMetadata } = this.props
    let asset = null
    let hasNext = false
    let hasPrev = false
    if (isolatedId) {
      if (pages) {
        const index = pages.findIndex(asset => (asset.id === isolatedId))
        asset = pages[index]
        hasPrev = index > 0
        hasNext = index < pages.length - 1
      }
      if (!asset && assets) {
        const index = assets.findIndex(asset => (asset.id === isolatedId))
        asset = assets[index]
        hasPrev = index > 0
        hasNext = index < assets.length - 1
      }
    }
    return (
      <div className="lightbox flexCol fullWidth fullHeight">
        <Lightbar showMetadata={lightboxMetadata.show}
                  onMetadata={this.showMetadata}/>
        <div className="lightbox-body flexOn fullWidth fullHeight">
          <Inspector asset={asset}
                     onNext={hasNext && (_ => this.isolateIndexOffset(1))}
                     onPrev={hasPrev && (_ => this.isolateIndexOffset(-1))} />
        </div>
        { lightboxMetadata.show && (
          <ResizableWindow onClose={this.closeMetadata} onMove={this.moveMetadata}
                           {...lightboxMetadata}
                           title={<div className="Lightbox-metadata-title"><div className="icon-register"/><div>Metadata</div></div>}>
            <Metadata2 assetIds={new Set([isolatedId])} dark={true} height="100%"/>
          </ResizableWindow>
          )
        }
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  pages: state.assets.pages,
  isolatedId: state.assets.isolatedId,
  lightboxMetadata: state.app.lightboxMetadata
}), dispatch => ({
  actions: bindActionCreators({ isolateAssetId, lightboxMetadata }, dispatch)
}))(Lightbox)
