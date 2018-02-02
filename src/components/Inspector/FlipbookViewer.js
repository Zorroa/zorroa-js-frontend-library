import React, { Component, PropTypes } from 'react'
import { PubSub } from '../../services/jsUtil'
import Asset from '../../models/Asset'
import Flipbook from './Flipbook'
import PanZoom from './PanZoom'
import SplitPane from 'react-split-pane'
import api from '../../api'
import ProgressCircle from '../ProgressCircle'

export default class FlipbookViewer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    fps: PropTypes.number,
    asset: PropTypes.instanceOf(Asset)
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()
    this.state = {
      playing: false,
      fps: 30,
      currentFrameNumber: 0,
      frames: [],
      totalFrames: 0,
      loadedImagesCount: true
    }
  }

  componentDidMount () {
    this.getFlipbookFrames(
      this.props.asset.document.source.clip.parent,
      window.width,
      window.innerHeight
    )

    this.status.on('playing', playing => {
      this.setState({ playing })
    })
    this.status.on('started', started => {
      this.setState({ started })
    })
    this.status.on('played', currentFrameNumber => {
      this.setState({ currentFrameNumber })
    })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.asset !== nextProps.asset) {
      this.getFlipbookFrames(nextProps.asset.document.source.clip.parent)
    }
  }

  componentWillUnmount () {
    this.status.off()
    this.shuttler.off()
  }

  getFlipbookFrames (flipbookAssetId) {
    api
      .flipbook
      .get(flipbookAssetId)
      .then(frames => {
        console.log(frames)
        this.setState({
          frames: frames,
          totalFrames: getTotalFrames(frames)
        })
      })
  }

  onError = (error) => {
    if (this.props.onError !== undefined) {
      this.props.onError(error)
    }
  }

  onFrameFrequency = fps => {
    this.setState({
      fps
    })
  }

  scrub = (frame) => {
    this.shuttler.publish('scrub', frame)
  }

  onFrameLoaded = loadedImagesCount => {
    this.setState({
      loadedImagesCount
    })
  }

  getLoadedPercentage () {
    const percentage = Math.floor((this.state.loadedImagesCount / this.state.frames.length) * 100)

    if (Number.isNaN(percentage)) {
      return 0
    }

    return percentage
  }

  render () {
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      rate: this.state.fps,
      options: [12, 24, 30]
    }

    return (
      <div className="FlipbookViewer">
        <SplitPane
          split="horizontal"
          defaultSize={40}
          maxSize={320}
          primary="second"
          pane1ClassName="FlipbookViewer__pan-zoom"
          resizerClassName="FlipbookViewer__film-strip-grabber"
        >
          <div>
            { this.getLoadedPercentage() < 1 && (
              <div className="FlipbookViewer__loading-status">
                <ProgressCircle percentage={ this.getLoadedPercentage() } />
              </div>
            )}
            <PanZoom
              frameFrequency={frameFrequency}
              onScrub={this.scrub}
              shuttler={this.shuttler}
              playing={this.state.playing}
              currentFrameNumber={this.state.currentFrameNumber}
              totalFrames={this.state.totalFrames}
            >
              <Flipbook
                fps={this.state.fps}
                onError={this.onError}
                shuttler={this.shuttler}
                status={this.status}
                frames={this.state.frames}
                totalFrames={this.state.totalFrames}
                onFrameLoaded={this.onFrameLoaded}
              />
            </PanZoom>
          </div>
          <div className="FlipbookViewer__film-strip">
            Draggable filmstrip area
          </div>
        </SplitPane>
      </div>
    )
  }
}

function getTotalFrames (frames) {
  return frames.reduce((numberOfFrames, frame) => {
    if (frame.number > numberOfFrames) {
      return frame.number
    }

    return numberOfFrames
  }, 0)
}
