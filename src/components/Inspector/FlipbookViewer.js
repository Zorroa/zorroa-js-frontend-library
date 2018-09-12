import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { PubSub } from '../../services/jsUtil'
import Flipbook from '../Flipbook/FlipbookImage/index.js'
import PanZoom from './PanZoom'
import Filmstrip from './Filmstrip/index.js'
import { defaultFpsFrequencies } from '../../constants/defaultState.js'
import Asset from '../../models/Asset'
import User from '../../models/User'
import keydown from 'react-keydown'
import Metadata from '../Metadata'
import ResizableWindow from '../ResizableWindow'

export default class FlipbookViewer extends PureComponent {
  static propTypes = {
    clipParentId: PropTypes.string.isRequired,
    onError: PropTypes.func,
    actions: PropTypes.shape({
      setFlipbookFps: PropTypes.func.isRequired,
      shouldLoop: PropTypes.func.isRequired,
      shouldHold: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
      lightboxMetadata: PropTypes.func.isRequired,
    }),
    shouldLoop: PropTypes.bool,
    fps: PropTypes.number.isRequired,
    isolatedAsset: PropTypes.instanceOf(Asset),
    shouldHold: PropTypes.bool,
    lightboxMetadata: PropTypes.shape({
      show: PropTypes.bool.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.state = {
      playing: false,
      loopPaused: false,
      shouldDeferImageLoad: true,
      playingFrame: undefined,
    }
  }

  onHoldToggle = () => {
    this.props.actions.shouldHold(!this.props.shouldHold)
  }

  componentDidMount() {
    this.registerStatusEventHandlers()
  }

  registerStatusEventHandlers() {
    this.status.on('playing', playing => {
      this.setState({ playing })
    })
    this.status.on('loopPaused', loopPaused => {
      this.setState({ loopPaused })
    })
    this.status.on('load', () => {
      this.setState({
        shouldDeferImageLoad: false,
      })
    })
    this.status.on('playedFlipbookFrame', activeFrame => {
      this.setState({
        playingFrame: activeFrame,
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    const nextAsset = nextProps.isolatedAsset
    if (
      nextAsset &&
      nextAsset !== this.props.isolatedAsset &&
      nextAsset.clipType() === 'flipbook'
    ) {
      this.shuttler.publish('scrub', nextAsset.startPage())
    }
  }

  componentWillUnmount() {
    this.status.off()
    this.shuttler.off()
  }

  onError = error => {
    if (this.props.onError !== undefined) {
      this.props.onError(error)
    }
  }

  scrub = frame => {
    this.shuttler.publish('scrub', frame)
  }

  onFrameFrequency = frameRate => {
    this.props.actions.setFlipbookFps(frameRate)
  }

  @keydown('.')
  nextFrame() {
    this.shuttler.publish('frameForward')
  }

  @keydown(',')
  previousFrame() {
    this.shuttler.publish('frameBack')
  }

  @keydown('space')
  startOrStop(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }

    this.shuttler.publish('startOrStop')
  }

  getDefaultFrameFromIsolatedAsset() {
    const asset = this.props.isolatedAsset
    if (asset.clipType() === 'flipbook') {
      return asset
    }

    return undefined
  }

  onLoopToggle = () => {
    if (this.state.loopPaused) {
      this.shuttler.publish('rewind')
    }

    this.props.actions.shouldLoop(!this.props.shouldLoop)
  }

  toggleMetadata = event => {
    this.updateMetadata({
      show: !this.props.lightboxMetadata.show,
    })
  }

  closeMetadata = event => {
    this.updateMetadata({
      show: false,
    })
    event.stopPropagation()
  }

  moveMetadata = moveMetadata => {
    this.updateMetadata(moveMetadata)
  }

  updateMetadata(lightboxMetadataChange) {
    const { user, userSettings } = this.props
    const lightboxMetadata = {
      ...this.props.lightboxMetadata,
      ...lightboxMetadataChange,
    }
    this.props.actions.lightboxMetadata(lightboxMetadata)
    this.props.actions.saveUserSettings(user, {
      ...userSettings,
      lightboxMetadata,
    })
  }

  shouldDisplayMetadata() {
    const { lightboxMetadata } = this.props
    const shouldShowMetadata = lightboxMetadata.show
    const hasAsset = this.state.playingFrame instanceof Asset
    return shouldShowMetadata && hasAsset
  }

  render() {
    const { playing, playingFrame } = this.state
    const { shouldHold } = this.props
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      options: defaultFpsFrequencies,
      rate: this.props.fps,
    }
    const panZoomClassNames = classnames('FlipbookViewer__pan-zoom')
    const metadataTitle = (
      <div className="Lightbox-metadata-title">
        <div className="Lightbox__metadata-icon icon-register" />
        <div>Metadata</div>
      </div>
    )

    return (
      <div className="FlipbookViewer">
        {this.shouldDisplayMetadata() && (
          <ResizableWindow
            onClose={this.closeMetadata}
            onMove={this.moveMetadata}
            preventOutOfBounds
            {...this.props.lightboxMetadata}
            title={metadataTitle}
            classes="FlipbookViewer__metadata-container">
            <Metadata
              assetIds={new Set([playingFrame.id])}
              dark={true}
              height="100%"
              isolatedId={playingFrame.id}
            />
          </ResizableWindow>
        )}
        <div className="FlipbookViewer__media">
          <div className={panZoomClassNames}>
            <PanZoom
              frameFrequency={frameFrequency}
              onScrub={this.scrub}
              shuttler={this.shuttler}
              status={this.status}
              onLoop={this.onLoopToggle}
              playing={playing}
              loopPaused={this.state.loopPaused}
              shouldLoop={this.props.shouldLoop}
              onHold={this.onHoldToggle}
              shouldHold={shouldHold}>
              <Flipbook
                onError={this.onError}
                shuttler={this.shuttler}
                status={this.status}
                autoPlay={true}
                shouldLoop={this.props.shouldLoop}
                defaultFrame={this.getDefaultFrameFromIsolatedAsset()}
                clipParentId={this.props.clipParentId}
              />
            </PanZoom>
          </div>
        </div>
        <Filmstrip
          shuttler={this.shuttler}
          status={this.status}
          clipParentId={this.props.clipParentId}
          deferImageLoad={this.state.shouldDeferImageLoad}
        />
      </div>
    )
  }
}
