import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { PubSub } from '../../services/jsUtil'
import { Flipbook, withFlipbook } from '../Flipbook'
import FlipbookStrip from './FlipbookStrip'
import PanZoom from './PanZoom'
import ProgressCircle from '../ProgressCircle'
import { setFlipbookFps, shouldLoop } from '../../actions/appActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defaultFpsFrequencies } from '../../constants/defaultState.js'
import Asset from '../../models/Asset'
import keydown from 'react-keydown'

class FlipbookViewer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    frames: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        imageBitmap: PropTypes.instanceOf(window.ImageBitmap),
        number: PropTypes.number.isRequired,
      }),
    ).isRequired,
    actions: PropTypes.shape({
      setFlipbookFps: PropTypes.func,
      shouldLoop: PropTypes.func,
    }),
    shouldLoop: PropTypes.bool,
    totalFrames: PropTypes.number.isRequired,
    loadedPercentage: PropTypes.number.isRequired,
    fps: PropTypes.number.isRequired,
    isolatedAsset: PropTypes.instanceOf(Asset),
  }

  constructor(props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.state = {
      playing: false,
      currentFrameNumber: 0,
      loopPaused: false,
    }
  }

  componentDidMount() {
    this.status.on('playing', playing => {
      this.setState({ playing })
    })
    this.status.on('played', currentFrameNumber => {
      this.setState({ currentFrameNumber })
    })
    this.status.on('loopPaused', loopPaused => {
      this.setState({ loopPaused })
    })
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isolatedAsset !== this.props.isolatedAsset &&
      nextProps.isolatedAsset.clipType() === 'flipbook' &&
      nextProps.isolatedAsset.document.media &&
      nextProps.isolatedAsset.document.media.clip
    ) {
      this.shuttler.publish(
        'scrub',
        nextProps.isolatedAsset.document.media.clip.start,
      )
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

  getLoadedPercentage() {
    return this.props.loadedPercentage
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
    if (
      this.props.isolatedAsset.document.media &&
      this.props.isolatedAsset.document.media.clip &&
      this.props.isolatedAsset.document.media.clip.start
    ) {
      return this.props.isolatedAsset.document.media.clip.start
    }

    return 1
  }

  onLoopToggle = () => {
    if (this.state.loopPaused) {
      this.shuttler.publish('rewind')
    }

    this.props.actions.shouldLoop(!this.props.shouldLoop)
  }

  render() {
    const isLoading =
      this.getLoadedPercentage() < 100 || this.props.frames.length === 0
    const { currentFrameNumber, playing } = this.state
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      options: defaultFpsFrequencies,
      rate: this.props.fps,
    }
    const panZoomClassNames = classnames('FlipbookViewer__pan-zoom', {
      'FlipbookViewer__pan-zoom--is-loading': isLoading,
    })

    return (
      <div className="FlipbookViewer">
        {isLoading === true && (
          <div className="FlipbookViewer__loading-status">
            <ProgressCircle percentage={this.getLoadedPercentage()} />
          </div>
        )}
        {isLoading === false && (
          <div className="FlipbookViewer__media">
            <div className={panZoomClassNames}>
              <PanZoom
                frameFrequency={frameFrequency}
                onScrub={this.scrub}
                shuttler={this.shuttler}
                onLoop={this.onLoopToggle}
                playing={playing}
                loopPaused={this.state.loopPaused}
                shouldLoop={this.props.shouldLoop}
                currentFrameNumber={currentFrameNumber}
                totalFrames={this.props.totalFrames}>
                <Flipbook
                  shouldLoop={this.props.shouldLoop}
                  onError={this.onError}
                  shuttler={this.shuttler}
                  status={this.status}
                  frames={this.props.frames}
                  totalFrames={this.props.totalFrames}
                  autoPlay={false}
                  defaultFrame={this.getDefaultFrameFromIsolatedAsset()}
                />
              </PanZoom>
            </div>
            <FlipbookStrip
              totalFrames={this.props.totalFrames}
              shuttler={this.shuttler}
              frames={this.props.frames}
              currentFrameNumber={currentFrameNumber}
            />
          </div>
        )}
      </div>
    )
  }
}

const ConnectedFlipbookViewer = connect(
  state => ({
    fps: state.app.flipbookFps,
    shouldLoop: state.app.shouldLoop,
    isolatedAsset: state.assets.all.find(
      asset => asset.id === state.assets.isolatedId,
    ),
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        setFlipbookFps,
        shouldLoop,
      },
      dispatch,
    ),
  }),
)(FlipbookViewer)

export default withFlipbook(ConnectedFlipbookViewer)
