import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import keydown from 'react-keydown'
import { withRouter } from 'react-router-dom'
import User from '../../models/User'
import Asset from '../../models/Asset'
import Lightbar from './Lightbar'
import Inspector from '../Inspector'
import Metadata from '../Metadata'
import ResizableWindow from '../ResizableWindow'
import { isolateAssetId, searchAssets } from '../../actions/assetsAction'
import { lightboxMetadata } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import AssetSearch from '../../models/AssetSearch'

class Lightbox extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    match: PropTypes.shape({
      params: PropTypes.shape({
        isolatedId: PropTypes.string.isRequired,
      }),
    }).isRequired,
    lightboxMetadata: PropTypes.shape({
      show: PropTypes.bool.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.shape({
      searchAssets: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
      lightboxMetadata: PropTypes.func.isRequired,
      isolateAssetId: PropTypes.func.isRequired,
    }),
    history: PropTypes.object,
  }

  @keydown('esc')
  closeLightbox(event) {
    this.props.history.goBack()
    this.props.actions.isolateAssetId()
  }

  @keydown('right')
  nextAsset(event) {
    this.isolateIndexOffset(1)
  }

  @keydown('left')
  previousAsset(event) {
    this.isolateIndexOffset(-1)
  }

  getIsolatedId() {
    return this.props.match.params.isolatedId
  }

  componentWillMount() {
    const { assets, match } = this.props
    const { params } = match
    const { isolatedId } = params
    const asset = assets && assets.find(asset => asset.id === isolatedId)
    if (!asset) {
      const assetSearchQuery = new AssetSearch({
        filter: {
          terms: {
            _id: [this.getIsolatedId()],
          },
        },
        size: 1,
      })
      this.props.actions.searchAssets(assetSearchQuery)
      this.props.actions.isolateAssetId(isolatedId)
    }
  }

  isolateIndexOffset(offset) {
    const { assets, actions } = this.props
    const isolatedId = this.getIsolatedId()
    const index = assets.findIndex(asset => asset.id === isolatedId)
    if (index + offset >= 0 && index + offset < assets.length) {
      actions.isolateAssetId(assets[index + offset].id)
    }
  }

  toggleMetadata = event => {
    const { user, userSettings } = this.props
    const lightboxMetadata = {
      ...this.props.lightboxMetadata,
      show: !this.props.lightboxMetadata.show,
    }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, {
      ...userSettings,
      lightboxMetadata,
    })
  }

  closeMetadata = event => {
    const { user, userSettings } = this.props
    const lightboxMetadata = { ...this.props.lightboxMetadata, show: false }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, {
      ...userSettings,
      lightboxMetadata,
    })
    event.stopPropagation()
  }

  moveMetadata = ({ left, top, width, height }) => {
    const { user, userSettings } = this.props
    const lightboxMetadata = {
      ...this.props.lightboxMetadata,
      left,
      top,
      width,
      height,
    }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, {
      ...userSettings,
      lightboxMetadata,
    })
  }

  render() {
    const { assets, lightboxMetadata } = this.props
    const isolatedId = this.getIsolatedId()

    let asset = null
    let hasNext = false
    let hasPrev = false
    if (isolatedId) {
      if (!asset && assets) {
        const index = assets.findIndex(asset => asset.id === isolatedId)
        asset = assets[index]
        hasPrev = index > 0
        hasNext = index < assets.length - 1
      }
    }

    if (!asset) {
      return <div>No asset available</div>
    }

    const metadataTitle = (
      <div className="Lightbox-metadata-title">
        <div className="Lightbox__metadata-icon icon-register" />
        <div>Metadata</div>
      </div>
    )

    // By using an inspectorKey that's set to an asset ID, we force a re-render
    // of the inspector when the asset changes. This is essential to ensure child
    // canvas elements get the correct and latest render output. We also assume
    // that if a parent ID is shared between assets a full re-render isn't needed.
    const inspectorKey = asset.parentId() || asset.id

    return (
      <div className="lightbox dark">
        <Lightbar
          showMetadata={lightboxMetadata.show}
          onMetadata={this.toggleMetadata}
        />
        <div className="lightbox-body">
          <Inspector
            asset={asset}
            key={inspectorKey}
            onNext={hasNext ? () => this.isolateIndexOffset(1) : null}
            onPrev={hasPrev ? () => this.isolateIndexOffset(-1) : null}
          />
        </div>
        {lightboxMetadata.show && (
          <ResizableWindow
            onClose={this.closeMetadata}
            onMove={this.moveMetadata}
            preventOutOfBounds
            {...lightboxMetadata}
            title={metadataTitle}>
            <Metadata
              assetIds={new Set([isolatedId])}
              dark={true}
              height="100%"
            />
          </ResizableWindow>
        )}
      </div>
    )
  }
}

const ConnectedLightbox = connect(
  state => ({
    assets: state.assets.all,
    lightboxMetadata: state.app.lightboxMetadata,
    user: state.auth.user,
    userSettings: state.app.userSettings,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateAssetId,
        lightboxMetadata,
        saveUserSettings,
        searchAssets,
      },
      dispatch,
    ),
  }),
)(Lightbox)

export default withRouter(ConnectedLightbox)
