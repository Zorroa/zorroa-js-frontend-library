import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

import { setVideoVolume } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { formatDuration, PubSub } from '../../services/jsUtil'
import PanZoom from './PanZoom'
import VideoRange from './VideoRange'
import Video from '../Video'
import User from '../../models/User'

class VideoViewer extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    backgroundURL: PropTypes.string,
    frames: PropTypes.number,
    frameRate: PropTypes.number,
    startFrame: PropTypes.number,
    stopFrame: PropTypes.number,
    videoVolume: PropTypes.number,
    onError: PropTypes.func.isRequired,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  static defaultProps = {
    frameRate: 30
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.status.on('played', played => { this.setState({ played }) })
    this.status.on('started', started => { this.setState({ started }) })

    this.state = {
      started: false,
      volume: this.props.videoVolume,
      played: 0,
      startFrame: this.props.startFrame,
      stopFrame: this.props.stopFrame,
      clipStartFrame: Number.MAX_SAFE_INTEGER,
      clipStopFrame: -Number.MAX_SAFE_INTEGER
    }
  }

  componentDidMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const { frames, startFrame, stopFrame, url } = nextProps
    this.setState({ startFrame, stopFrame, played: 0 })
    if (this.state.clipStartFrame === Number.MAX_SAFE_INTEGER || url !== this.props.url) {
      const clipStartFrame = Math.max(0, startFrame - (stopFrame - startFrame))
      const clipStopFrame = Math.min(frames - 1, stopFrame + (stopFrame - startFrame))
      this.setState({clipStartFrame, clipStopFrame})
    }
  }

  @keydown('space')
  playPause (event) {
    if (event) event.preventDefault()
    this.shuttler.publish('startOrStop')
  }

  setVolume = e => {
    const volume = parseFloat(e.target.value)
    this.setState({ volume })
    this.props.actions.setVideoVolume(volume)
    const settings = { ...this.props.userSettings, videoVolume: volume }
    this.props.actions.saveUserSettings(this.props.user, settings)
  }

  scrub = (frame) => this.shuttler.publish('scrub', frame)

  clipRange = (clipStartFrame, clipStopFrame) => {
    if (clipStartFrame < 0 || clipStopFrame > this.props.frames - 1) return
    if (clipStartFrame > clipStopFrame) clipStartFrame = clipStopFrame
    this.setState({ clipStartFrame, clipStopFrame })
  }

  range = (startFrame, stopFrame) => {
    if (startFrame < 0 || stopFrame > this.props.frames - 1) return
    if (startFrame > stopFrame) startFrame = stopFrame
    this.setState({ startFrame, stopFrame })
    if (startFrame < this.state.clipStartFrame) this.setState({ clipStartFrame: startFrame })
    if (stopFrame > this.state.clipStopFrame) this.setState({ clipStopFrame: stopFrame })
  }

  render () {
    const { url, frameRate, frames, backgroundURL, onError } = this.props
    const { started, volume, played, startFrame, stopFrame, clipStartFrame, clipStopFrame } = this.state
    const seconds = played ? (played * frames - startFrame) / frameRate : 0
    const duration = (stopFrame - startFrame) / frameRate
    const title = <div className="VideoViewer-time"><Duration className='VideoViewer-remaining' seconds={seconds} frameRate={frameRate} />/<Duration seconds={duration} frameRate={frameRate}/></div>
    const total = frames * 10
    return (
      <div className='VideoViewer'>
        <div className="VideoViewer-pan-zoom">
          <PanZoom title={title} titleWidth={300}
                   shuttler={this.shuttler} playing={started}
                   onVolume={this.setVolume} volume={volume}>
            <Video url={url}
                 backgroundURL={backgroundURL}
                 frames={frames}
                 frameRate={frameRate}
                 startFrame={startFrame}
                 stopFrame={stopFrame}
                 onError={onError}
                 shuttler={this.shuttler}
                 status={this.status}
            />
          </PanZoom>
        </div>
        <VideoRange played={played} frames={frames} frameRate={frameRate}
                    startFrame={startFrame} stopFrame={stopFrame} total={total}
                    clipStartFrame={clipStartFrame} clipStopFrame={clipStopFrame}
                    onScrub={this.scrub} onClipRange={this.clipRange}
                    onRange={this.range} backgroundURL={backgroundURL}/>
      </div>
    )
  }
}

export default connect(state => ({
  videoVolume: state.app.videoVolume,
  user: state.auth.user,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    setVideoVolume,
    saveUserSettings
  }, dispatch)
}))(VideoViewer)

const Duration = ({ className, seconds, frameRate }) => {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={className || 'VideoViewer-duration'}>
      {formatDuration(seconds, frameRate)}
    </time>
  )
}

Duration.propTypes = {
  seconds: PropTypes.number.isRequired,
  frameRate: PropTypes.number.isRequired,
  className: PropTypes.string
}

