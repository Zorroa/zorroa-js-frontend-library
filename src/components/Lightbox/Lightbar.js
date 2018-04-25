import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import downloadjs from 'downloadjs'
import api from '../../api'
import getImage from '../../services/getImage'
import { withRouter } from 'react-router-dom'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Folders from '../Folders'
import FieldTemplate from '../FieldTemplate'
import { isolateAssetId } from '../../actions/assetsAction'
import { addAssetIdsToFolderId } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'

class Lightbar extends Component {
  static displayName = 'Lightbar'

  static propTypes = {
    showMetadata: PropTypes.bool.isRequired,
    onMetadata: PropTypes.func.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    asset: PropTypes.instanceOf(Asset),
    isolatedId: PropTypes.string,
    lightbarFieldTemplate: PropTypes.string,
    origin: PropTypes.string,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object,
    history: PropTypes.object,
  }

  state = {
    showFolders: false,
    addingToCollection: false,
  }

  closeLightbox() {
    this.props.history.goBack()
    this.props.actions.isolateAssetId()
  }

  release = event => {
    this.forceUpdate() // force redraw to clear isDragging CSS classnames
  }

  isolatedAssetURL() {
    const { asset, origin } = this.props
    if (!asset) return
    return asset.url(origin)
  }

  onDownload = () => {
    const { asset, origin } = this.props
    const { source } = asset.document
    const { mediaType, filename } = source
    const options = {
      format: 'blob',
    }

    if (asset.clipType() === 'flipbook') {
      api.flipbook
        .get(asset.parentId())
        .then(assets => {
          return Promise.all(
            assets.map(childAsset => {
              const imageUrl = childAsset.url(origin)
              return getImage(imageUrl, options).then(image => ({
                image,
                ...childAsset,
              }))
            }),
          )
        })
        .then(assetImages => {
          assetImages.forEach((assetImage, index) => {
            setTimeout(() => {
              downloadjs(
                assetImage.image,
                assetImage.document.source.filename,
                assetImage.document.source.mediaType,
              )
            }, index * 1000)
          })
        })
      return
    }

    getImage(this.isolatedAssetURL(), options).then(image => {
      downloadjs(image, filename, mediaType)
    })
  }

  showFolders = event => {
    this.setState({ showFolders: !this.state.showFolders })
    event.preventDefault()
  }

  addToCollection = (folder, event) => {
    this.setState({ showFolders: false })
    const { isolatedId, actions } = this.props
    const ids = new Set([isolatedId])
    actions.addAssetIdsToFolderId(ids, folder.id)
    this.setState({ addingToCollection: `Added ${ids.size} to ${folder.name}` })
    if (this.addingTimeout) clearTimeout(this.addingTimout)
    this.addingTimeout = setTimeout(() => {
      this.setState({ addingToCollection: null })
      this.addingTimeout = null
    }, 3000)
  }

  render() {
    const {
      assets,
      asset,
      isolatedId,
      user,
      showMetadata,
      onMetadata,
      lightbarFieldTemplate,
    } = this.props
    const {
      actionWidth,
      lightbarHeight,
      showFolders,
      addingToCollection,
    } = this.state
    return (
      <div className="Lightbar" style={{ height: lightbarHeight }}>
        <div className="Lightbar-metadata">
          <div
            onClick={onMetadata}
            className={classnames('Lightbar__settings', 'icon-arrow-down', {
              'Lightbar__settings--is-open': showMetadata,
            })}
          />
          <FieldTemplate
            asset={asset}
            template={lightbarFieldTemplate}
            extensionOnLeft={true}
          />
        </div>
        <div
          className="Lightbar-actions"
          style={{ width: actionWidth, minWidth: actionWidth }}>
          <div className="Lightbar-action" onClick={this.onDownload}>
            <i className="Lightbar__icon icon-download2" />
            <span className="Lightbar-action-text Lightbar-action-download">
              Download
            </span>
          </div>
          <div onClick={this.showFolders} className="Lightbar-action">
            <span className="Lightbar-action-text Lightbar-action-add-to-collection">
              Add to Collection
            </span>
            <i className="Lightbar__context icon-chevron-down" />
            {showFolders && (
              <div
                className="Lightbar-folders"
                onClick={e => {
                  e.stopPropagation()
                }}>
                <Folders
                  filterName="simple"
                  onSelect={this.addToCollection}
                  filter={f =>
                    !f.isDyhi() &&
                    !f.search &&
                    (f.childCount ||
                      f.canAddAssetIds(new Set([isolatedId]), assets, user))
                  }
                />
              </div>
            )}
            {addingToCollection && (
              <div className="Lightbar-performed-action">
                {addingToCollection}
              </div>
            )}
          </div>
          <div
            className="Lightbar-close icon-cross"
            onClick={this.closeLightbox.bind(this)}
          />
        </div>
      </div>
    )
  }
}

const ConnectedLightbar = connect(
  state => ({
    assets: state.assets.all,
    asset: state.assets.all.find(asset => asset.id === state.assets.isolatedId),
    isolatedId: state.assets.isolatedId,
    lightbarFieldTemplate: state.app.lightbarFieldTemplate,
    origin: state.auth.origin,
    user: state.auth.user,
    userSettings: state.app.userSettings,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateAssetId,
        addAssetIdsToFolderId,
        saveUserSettings,
      },
      dispatch,
    ),
  }),
)(Lightbar)

export default withRouter(ConnectedLightbar)
