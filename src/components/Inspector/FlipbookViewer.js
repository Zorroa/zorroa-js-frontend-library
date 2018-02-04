import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { PubSub } from '../../services/jsUtil'
import { Flipbook, withFlipbook } from '../Flipbook'
import FlipbookStrip from './FlipbookStrip'
import PanZoom from './PanZoom'
import ProgressCircle from '../ProgressCircle'

class FlipbookViewer extends Component {
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
    const isLoading = this.getLoadedPercentage() < 100 || this.props.frames.length === 0
    const { currentFrameNumber, playing } = this.state
    const frameFrequency = {
      onFrameFrequency: this.onFrameFrequency,
      rate: this.state.fps,
      options: [12, 24, 30]
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
                  fps={this.state.fps}
                  onError={this.onError}
                  shuttler={this.shuttler}
                  status={this.status}
                  frames={this.props.frames}
                  totalFrames={this.props.totalFrames}
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

export default withFlipbook(FlipbookViewer)
