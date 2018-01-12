import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import keydown from 'react-keydown'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Lightbar from './Lightbar'
import Inspector from '../Inspector'
import Metadata from '../Metadata'
import ResizableWindow from '../ResizableWindow'
import { isolateAssetId } from '../../actions/assetsAction'
import { lightboxMetadata } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'

class Lightbox extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string.isRequired,
    lightboxMetadata: PropTypes.shape({
      show: PropTypes.bool.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired
    }),
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
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

  toggleMetadata = (event) => {
    const { user, userSettings } = this.props
    const lightboxMetadata = { ...this.props.lightboxMetadata, show: !this.props.lightboxMetadata.show }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, { ...userSettings, lightboxMetadata })
  }

  closeMetadata = (event) => {
    const { user, userSettings } = this.props
    const lightboxMetadata = { ...this.props.lightboxMetadata, show: false }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, { ...userSettings, lightboxMetadata })
    event.stopPropagation()
  }

  moveMetadata = ({left, top, width, height}) => {
    const { user, userSettings } = this.props
    const lightboxMetadata = { ...this.props.lightboxMetadata, left, top, width, height }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, { ...userSettings, lightboxMetadata })
  }

  render () {
    const { assets, isolatedId, lightboxMetadata } = this.props
    let asset = null
    let hasNext = false
    let hasPrev = false
    if (isolatedId) {
      if (!asset && assets) {
        const index = assets.findIndex(asset => (asset.id === isolatedId))
        asset = assets[index]
        hasPrev = index > 0
        hasNext = index < assets.length - 1
      }
    }
    return (
      <div className="lightbox">
        <Lightbar showMetadata={lightboxMetadata.show}
                  onMetadata={this.toggleMetadata}/>
        <div className="lightbox-body">
          <Inspector asset={asset}
                     onNext={hasNext ? _ => this.isolateIndexOffset(1) : null}
                     onPrev={hasPrev ? _ => this.isolateIndexOffset(-1) : null} />
        </div>
        { lightboxMetadata.show && (
          <ResizableWindow onClose={this.closeMetadata} onMove={this.moveMetadata}
                           {...lightboxMetadata}
                           title={<div className="Lightbox-metadata-title"><div className="Lightbox__metadata-icon icon-register"/><div>Metadata</div></div>}>
            <Metadata assetIds={new Set([isolatedId])} dark={true} height="100%"/>
          </ResizableWindow>
          )
        }
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  isolatedId: state.assets.isolatedId,
  lightboxMetadata: state.app.lightboxMetadata,
  user: state.auth.user,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    lightboxMetadata,
    saveUserSettings
  }, dispatch)
}))(Lightbox)
