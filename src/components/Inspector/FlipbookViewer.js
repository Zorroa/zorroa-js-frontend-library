import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { PubSub } from '../../services/jsUtil'
import Flipbook from '../Flipbook/FlipbookImage/index.js'
import PanZoom from './PanZoom'
import Filmstrip from './Filmstrip/index.js'
import {
  setFlipbookFps,
  shouldLoop,
  shouldHold as actionShouldHold,
} from '../../actions/appActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defaultFpsFrequencies } from '../../constants/defaultState.js'
import Asset from '../../models/Asset'
import keydown from 'react-keydown'

class FlipbookViewer extends Component {
  static propTypes = {
    clipParentId: PropTypes.string.isRequired,
    onError: PropTypes.func,
    actions: PropTypes.shape({
      setFlipbookFps: PropTypes.func,
      shouldLoop: PropTypes.func,
      shouldHold: PropTypes.func,
    }),
    shouldLoop: PropTypes.bool,
    fps: PropTypes.number.isRequired,
    isolatedAsset: PropTypes.instanceOf(Asset),
    shouldHold: PropTypes.bool,
  }

  constructor(props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.state = {
      playing: false,
      loopPaused: false,
      shouldDeferImageLoad: true,
    }
  }

  onHoldToggle = () => {
    this.props.actions.shouldHold(!this.props.shouldHold)
  }

  componentDidMount() {
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
  }

  componentWillReceiveProps(nextProps) {
    const nextAsset = nextProps.isolatedAsset
    if (
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

  render() {
    const { playing } = this.state
    const { shouldHold } = this.props
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      options: defaultFpsFrequencies,
      rate: this.props.fps,
    }
    const panZoomClassNames = classnames('FlipbookViewer__pan-zoom')

    return (
      <div className="FlipbookViewer">
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

export default connect(
  state => ({
    fps: state.app.flipbookFps,
    shouldLoop: state.app.shouldLoop,
    shouldHold: state.app.shouldHold,
    isolatedAsset: state.assets.all.find(
      asset => asset.id === state.assets.isolatedId,
    ),
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        setFlipbookFps,
        shouldLoop,
        shouldHold: actionShouldHold,
      },
      dispatch,
    ),
  }),
)(FlipbookViewer)
