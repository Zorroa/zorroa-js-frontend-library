import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

import Asset from '../../models/Asset'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import Video from '../Video'
import { FlipbookPlayer } from '../Flipbook'
import { isolateAssetId } from '../../actions/assetsAction'
import { hideQuickview } from '../../actions/appActions'
import { PubSub } from '../../services/jsUtil'

class Quickview extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.instanceOf(Set),
    isolatedAsset: PropTypes.instanceOf(Asset).isRequired,
    isolatedId: PropTypes.string,
    origin: PropTypes.string,
    showQuickview: PropTypes.bool.isRequired,
    actions: PropTypes.shape({
      isolateAssetId: PropTypes.func.isRequired,
      hideQuickview: PropTypes.func.isRequired
    })
  }

  constructor (props) {
    super(props)
    this.state = {
      error: undefined
    }
    this.shuttler = new PubSub()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextProps.isolatedAsset.id !== this.props.isolatedAsset.id ||
      nextState.error !== this.state.error
    )
  }

  componentWillUpdate () {
    this.shuttler.publish('stop')
    this.shuttler.publish('load')
  }

  @keydown('left')
  onLeft () {
    this.onNavigation()
    this.back()
  }

  @keydown('right')
  onRight () {
    this.onNavigation()
    this.next()
  }

  onNavigation = () => {
    this.setState({
      error: undefined
    })
  }

  back () {
    const instanceIds = [...this.props.selectedIds]
    const instanceSelectionIndex = instanceIds.indexOf(this.props.isolatedAsset.id)
    const previousIndex = instanceSelectionIndex - 1
    const lastIndex = instanceIds.length - 1

    if (previousIndex < 0) {
      this.props.actions.isolateAssetId(instanceIds[lastIndex])
      return
    }

    this.props.actions.isolateAssetId(instanceIds[previousIndex])
  }

  next () {
    const instanceIds = [...this.props.selectedIds]
    const instanceSelectionIndex = instanceIds.indexOf(this.props.isolatedAsset.id)
    const nextIndex = instanceSelectionIndex + 1
    const firstIndex = 0

    if (instanceIds[nextIndex] === undefined) {
      this.props.actions.isolateAssetId(instanceIds[firstIndex])
      return
    }

    this.props.actions.isolateAssetId(instanceIds[nextIndex])
  }

  @keydown('space', 'esc')
  onEscape () {
    this.close()
  }

  close = () => {
    if (this.props.showQuickview === false) {
      return
    }

    this.onNavigation()
    this.props.actions.isolateAssetId()
    this.props.actions.hideQuickview()
  }

  isolatedAssetURL (width, height) {
    const { isolatedAsset, origin } = this.props

    return isolatedAsset.closestProxyURL(origin, width, height) // TODO consider changing these values to be more dynamic
  }

  isVideo () {
    const asset = this.props.isolatedAsset
    const mimeType = asset.mediaType()
    const parsedMimeString = mimeType.split('/')
    const mediaType = parsedMimeString[0]

    return mediaType === 'video'
  }

  isFlipbook () {
    const asset = this.props.isolatedAsset
    const type = asset.clipType()

    return type === 'flipbook'
  }

  getMediaType () {
    if (this.isVideo()) {
      return 'video'
    }

    if (this.isFlipbook()) {
      return 'flipbook'
    }

    return 'generic'
  }

  onError = () => {
    console.error('There was a problem loading the video.')
  }

  render () {
    let width = Math.floor(window.innerWidth * 0.75)
    let height = Math.floor(window.innerHeight * 0.75)
    const asset = this.props.isolatedAsset
    const aspectRatio = asset.proxyAspect()

    if (aspectRatio > 1) {
      height = Math.round(width / aspectRatio)
    } else {
      width = Math.round(height * aspectRatio)
    }

    const body = (
      <div className="Quickview__body">
        <ModalHeader closeFn={this.close}>
          {asset.source()}
        </ModalHeader>
        {
          this.state.error !== undefined && (
            <div className="Quickview__error">
              {this.state.error}
            </div>
          )
        }
        { this.getMediaType() === 'video' && (
          <div className="Quickview__video">
            <Video
              url={asset.url(this.props.origin)}
              backgroundURL={asset.backgroundURL()}
              frames={asset.frames()}
              frameRate={asset.frameRate()}
              startFrame={asset.startFrame()}
              stopFrame={asset.stopFrame()}
              onError={this.onError}
              shuttler={this.shuttler}
              status={(new PubSub())}
            />
          </div>
        )}
        { this.getMediaType() === 'flipbook' && (
          <div className="Quickview__flipbook">
            <FlipbookPlayer
              clipParentId={asset.document.source.clip.parent}
              height={height}
              width={width}
            />
          </div>
        )}
        { this.getMediaType() === 'generic' && (
          <div
            className="Quickview__image"
            style={{
              backgroundImage: `url(${this.isolatedAssetURL(width, height)})`,
              height,
              width
            }}
          />
        )}
      </div>
    )

    return (
      <div className="Quickview">
        <Modal
          onModalUnderlayClick={this.close}
          body={body}
          width={width}
        />
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  selectedIds: state.assets.selectedIds,
  isolatedAsset: state.assets.all.find(asset => asset.id === state.assets.isolatedId),
  origin: state.auth.origin,
  showQuickview: state.app.showQuickview
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    hideQuickview
  }, dispatch)
}))(Quickview)
