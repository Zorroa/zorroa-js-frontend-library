import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

// Reference: https://github.com/CookPete/react-player
import ReactPlayer from 'react-player'

import { setVideoVolume } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { formatDuration, clamp } from '../../services/jsUtil'
import PanZoom from './PanZoom'
import VideoRange from './VideoRange'
import User from '../../models/User'

class Video extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    backgroundURL: PropTypes.string,
    frames: PropTypes.number,
    frameRate: PropTypes.number,
    startFrame: PropTypes.number,
    stopFrame: PropTypes.number,
    videoVolume: PropTypes.number,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  static defaultProps = {
    frameRate: 30
  }

  state = {
    playing: true,
    volume: this.props.videoVolume,
    played: 0,
    loaded: 0,
    startFrame: this.props.startFrame,
    stopFrame: this.props.stopFrame,
    error: null
  }

  componentWillReceiveProps (nextProps) {
    const { startFrame, stopFrame } = nextProps
    this.setState({ startFrame, stopFrame, played: 0 })
  }

  @keydown('space')
  playPause () {
    this.setState({ playing: !this.state.playing })
  }

  setVolume = e => {
    const volume = parseFloat(e.target.value)
    this.setState({ volume })
    this.props.actions.setVideoVolume(volume)
    const settings = { ...this.props.userSettings, videoVolume: volume }
    this.props.actions.saveUserSettings(this.props.user, settings)
  }

  onProgress = state => {
    this.setState(state)
    const { frames } = this.props
    const { stopFrame } = this.state
    if (state.played >= stopFrame / frames) {
      this.setState({ playing: false, played: stopFrame / frames })
    }
  }

  rewind = () => {
    this.scrub(this.state.startFrame)
  }

  fastForward = () => {
    this.scrub(this.state.stopFrame)
  }

  frameBack = () => {
    const frame = Math.max(0, this.state.played * this.props.frames - 1)
    this.scrub(frame)
  }

  frameForward = () => {
    const frame = Math.min(this.state.played * this.props.frames + 1, this.props.frames - 1)
    this.scrub(frame)
  }

  shuttle = (action) => {
    switch (action) {
      case 'rewind': return this.rewind()
      case 'frameBack': return this.frameBack()
      case 'play': return this.playPause()
      case 'frameForward': return this.frameForward()
      case 'fastForward': return this.fastForward()
    }
  }

  scrub = (frame) => {
    const played = frame / this.props.frames
    this.setState({ played })
    this.player.seekTo(played)
  }

  clipTime (t) {
    const { frames } = this.props
    const { startFrame, stopFrame } = this.state
    return clamp((t * frames - startFrame) / (stopFrame - startFrame), 0, 1)
  }

  clipRange = (startFrame, stopFrame) => {
    this.setState({ startFrame, stopFrame })
  }

  init () {
    const { url } = this.props
    const { startFrame } = this.state
    const initialized = `${url}@${startFrame}`
    if (this.initialized === initialized) return
    this.scrub(startFrame)
    this.initialized = initialized
  }

  render () {
    const { url, frameRate, frames, backgroundURL } = this.props
    const { playing, volume, played, startFrame, stopFrame, error } = this.state
    const seconds = played ? (played * frames - startFrame) / frameRate : 0
    const duration = (stopFrame - startFrame) / frameRate
    const title = <div className="Video-time"><Duration className='Video-remaining' seconds={seconds} frameRate={frameRate} />/<Duration seconds={duration} frameRate={frameRate}/></div>
    const total = frames * 10
    return (
      <div className='Video'>
        <div className="Video-pan-zoom">
          { error && <div className="Video-error">{error.message}</div> }
          <PanZoom title={title} titleWidth={300}
                   onVideo={this.shuttle} playing={playing}
                   onVolume={this.setVolume} volume={volume}>
            <ReactPlayer
              ref={player => { this.player = player }}
              className='Video-player'
              url={url}
              width="100%"
              height="100%"
              playing={playing}
              volume={volume}
              onReady={() => this.init()}
              onPlay={() => this.setState({ playing: true })}
              onPause={() => this.setState({ playing: false })}
              onEnded={() => this.setState({ playing: false })}
              onError={error => this.setState({ error })}
              onProgress={this.onProgress}
              progressFrequency={100} />
          </PanZoom>
        </div>
        <VideoRange played={played} frames={frames} frameRate={frameRate}
                    startFrame={startFrame} stopFrame={stopFrame} total={total}
                    onScrub={this.scrub} onClipRange={this.clipRange} backgroundURL={backgroundURL}/>
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
}))(Video)

const Duration = ({ className, seconds, frameRate }) => {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={className || 'Video-duration'}>
      {formatDuration(seconds, frameRate)}
    </time>
  )
}

Duration.propTypes = {
  seconds: PropTypes.number.isRequired,
  frameRate: PropTypes.number.isRequired,
  className: PropTypes.string
}

