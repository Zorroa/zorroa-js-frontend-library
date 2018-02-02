import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { PubSub } from '../../services/jsUtil'
import { Flipbook } from '../Flipbook'
import PanZoom from './PanZoom'
import SplitPane from 'react-split-pane'
import ProgressCircle from '../ProgressCircle'

export default class FlipbookViewer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    totalFrames: PropTypes.number.isRequired,
    loadedPercentage: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()
    this.state = {
      playing: false,
      fps: 30,
      currentFrameNumber: 0
    }
  }

  componentDidMount () {
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

  componentWillUnmount () {
    this.status.off()
    this.shuttler.off()
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

  getLoadedPercentage () {
    return this.props.loadedPercentage
  }

  render () {
    const isLoading = this.getLoadedPercentage() < 100
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      rate: this.state.fps,
      options: [12, 24, 30]
    }
    const panZoomCLassNames = classnames('FlipbookViewer__pan-zoom', {
      'FlipbookViewer__pan-zoom--is-loading': isLoading
    })

    return (
      <div className="FlipbookViewer">
        <SplitPane
          split="horizontal"
          defaultSize={40}
          maxSize={320}
          primary="second"
          pane1ClassName=""
          resizerClassName="FlipbookViewer__film-strip-grabber"
        >
          <div className={panZoomCLassNames}>
            { isLoading && (
              <div className="FlipbookViewer__loading-status">
                <ProgressCircle percentage={ this.getLoadedPercentage() } />
              </div>
            )}
            { isLoading === false && (
              <PanZoom
                frameFrequency={frameFrequency}
                onScrub={this.scrub}
                shuttler={this.shuttler}
                playing={this.state.playing}
                currentFrameNumber={this.state.currentFrameNumber}
                totalFrames={this.props.totalFrames}
              >
                <Flipbook
                  fps={this.state.fps}
                  onError={this.onError}
                  shuttler={this.shuttler}
                  status={this.status}
                  frames={this.props.frames}
                  totalFrames={this.props.totalFrames}
                />
              </PanZoom>
            )}
          </div>
          <div className="FlipbookViewer__film-strip">
            Draggable filmstrip area
          </div>
        </SplitPane>
      </div>
    )
  }
}
