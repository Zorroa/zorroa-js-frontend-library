import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { PubSub } from '../../services/jsUtil'
import { Flipbook, withFlipbook } from '../Flipbook'
import FlipbookStrip from './FlipbookStrip'
import PanZoom from './PanZoom'
import ProgressCircle from '../ProgressCircle'
import { setFlipbookFps } from '../../actions/appActions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defaultFpsFrequencies } from '../../constants/defaultState.js'
import Asset from '../../models/Asset'

class FlipbookViewer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    actions: PropTypes.shape({
      setFlipbookFps: PropTypes.func
    }),
    totalFrames: PropTypes.number.isRequired,
    loadedPercentage: PropTypes.number.isRequired,
    fps: PropTypes.number.isRequired,
    isolatedAsset: PropTypes.instanceOf(Asset)
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.state = {
      playing: false,
      currentFrameNumber: 0
    }
  }

  componentDidMount () {
    this.status.on('playing', playing => {
      this.setState({ playing })
    })
    this.status.on('played', currentFrameNumber => {
      this.setState({ currentFrameNumber })
    })
  }

  componentWillUnmount () {
    this.status.off()
    this.shuttler.off()
  }

  onError = (error) => {
    if (this.props.onError !== undefined) {
      this.props.onError(error)
    }
  }

  scrub = (frame) => {
    this.shuttler.publish('scrub', frame)
  }

  getLoadedPercentage () {
    return this.props.loadedPercentage
  }

  onFrameFrequency = frameRate => {
    this.props.actions.setFlipbookFps(frameRate)
  }

  render () {
    const isLoading = this.getLoadedPercentage() < 100 || this.props.frames.length === 0
    const { currentFrameNumber, playing } = this.state
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      options: defaultFpsFrequencies,
      rate: this.props.fps
    }
    const panZoomClassNames = classnames('FlipbookViewer__pan-zoom', {
      'FlipbookViewer__pan-zoom--is-loading': isLoading
    })

    return (
      <div className="FlipbookViewer">
        { isLoading === true && (
          <div className="FlipbookViewer__loading-status">
            <ProgressCircle percentage={ this.getLoadedPercentage() } />
          </div>
        )}
        { isLoading === false && (
          <div className="FlipbookViewer__media">
            <div className={panZoomClassNames}>
              <PanZoom
                frameFrequency={frameFrequency}
                onScrub={this.scrub}
                shuttler={this.shuttler}
                playing={playing}
                currentFrameNumber={currentFrameNumber}
                totalFrames={this.props.totalFrames}
              >
                <Flipbook
                  onError={this.onError}
                  shuttler={this.shuttler}
                  status={this.status}
                  frames={this.props.frames}
                  totalFrames={this.props.totalFrames}
                  autoPlay={false}
                  defaultFrame={this.props.isolatedAsset.document.source.clip.frame.start}
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
        ) }
      </div>
    )
  }
}

const ConnectedFlipbookViewer = connect(
  (state) => ({
    fps: state.app.flipbookFps,
    isolatedAsset: state.assets.all.find(asset => asset.id === state.assets.isolatedId)
  }),
  dispatch => ({
    actions: bindActionCreators({
      setFlipbookFps
    }, dispatch)
  })
)(FlipbookViewer)

export default withFlipbook(ConnectedFlipbookViewer)
