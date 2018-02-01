import React, { Component, PropTypes } from 'react'
import { PubSub } from '../../services/jsUtil'
import Flipbook from './Flipbook'
import PanZoom from './PanZoom'
import SplitPane from 'react-split-pane'

import { connect } from 'react-redux'

class FlipbookViewer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    fps: PropTypes.number,
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    totalFrames: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()
    this.state = {
      resizing: false,
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

export default connect(state => ({
  frames: state.flipbook.frames,
  totalFrames: getTotalFrames(state.flipbook.frames)
}), () => ({}))(FlipbookViewer)
