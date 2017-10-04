import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

import { setVideoVolume } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { /*formatDuration,*/ clamp } from '../../services/jsUtil'
// import PanZoom from './PanZoom'
// import VideoRange from './VideoRange'
import User from '../../models/User'

class Vid extends Component {
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

  state = {
    playing: false,
    volume: this.props.videoVolume,
    played: 0,
    lastPlayed: 0,
    startFrame: this.props.startFrame,
    stopFrame: this.props.stopFrame,
    clipStartFrame: Number.MAX_SAFE_INTEGER,
    clipStopFrame: -Number.MAX_SAFE_INTEGER
  }

  resize = () => this.forceUpdate()

  componentDidMount () {
    window.addEventListener('resize', this.resize)
    this.componentWillReceiveProps(this.props)
    // this.start()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
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
    const playing = !this.state.playing
    if (playing) this.start()
    else this.stop()
    if (playing && this.state.played >= this.state.stopFrame / (this.props.frames - 1)) {
      this.scrub(this.state.startFrame)
    }
  }

  setVolume = e => {
    const volume = parseFloat(e.target.value)
    this.setState({ volume })
    this.player.volume = volume
    this.props.actions.setVideoVolume(volume)
    const settings = { ...this.props.userSettings, videoVolume: volume }
    this.props.actions.saveUserSettings(this.props.user, settings)
  }

  onProgress = () => {
    if (!this.player) return
    const { frames, frameRate } = this.props
    const { stopFrame, playing } = this.state
    const lastPlayed = this.state.played
    const played = this.player.currentTime / (frames / frameRate)
    if (played >= stopFrame / (frames - 1)) {
      this.stop()
      this.setState({ played: stopFrame / (frames - 1), lastPlayed })
    } else {
      if (played !== lastPlayed) this.setState({ played, lastPlayed })
    }
    if (playing) requestAnimationFrame(this.onProgress)
  }

  start = () => {
    this.setState({ playing: true }, this.onProgress)
    this.player.play()
  }

  stop = () => {
    this.setState({ playing: false })
    this.player.pause()
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
    const played = frame / (this.props.frames - 1)
    this.setState({ played })
    try {
      this.player.currentTime = played * this.props.frames / this.props.frameRate
    } catch (e) {
      console.log('Player isn\'t ready to seek: ' + e)
    }
  }

  clipTime (t) {
    const { frames } = this.props
    const { startFrame, stopFrame } = this.state
    return clamp((t * frames - startFrame) / (stopFrame - startFrame), 0, 1)
  }

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

  init = () => {
    const { url } = this.props
    const { startFrame, volume } = this.state
    const initialized = `${url}@${startFrame}`
    if (this.initialized === initialized) return
    this.player.volume = volume
    this.scrub(startFrame)
    this.initialized = initialized
  }

  render () {
    const { url, frameRate, frames, backgroundURL, onError } = this.props
    const { playing, volume, played, startFrame, stopFrame, clipStartFrame, clipStopFrame } = this.state
    const seconds = played ? (played * frames - startFrame) / frameRate : 0
    // const duration = (stopFrame - startFrame) / frameRate
    // const title = <div className="Vid-time"><Duration className='Vid-remaining' seconds={seconds} frameRate={frameRate} />/<Duration seconds={duration} frameRate={frameRate}/></div>
    const total = frames * 10
    const exts = [ 'mp4', 'm4v', 'webm', 'ogv', 'ogg' ]
    return (
      <div className='Vid'>
        <video className="Vid-video"
               onCanPlay={this.init}
               autoPlay={playing}
               onPlay={ this.start }
               onPause={ this.stop }
               onEnded={ this.stop }
               onError={e => onError && onError(e.target.error)}
               width="100%" height="100%"
               ref={player => { this.player = player }}>
          { exts.map(ext => <source key={ext} src={`${url}?ext=${ext}`} type={`video/${ext}`}/>) }
          <source key="raw" src={url}/>
        </video>
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
}))(Vid)

// const Duration = ({ className, seconds, frameRate }) => {
//   return (
//     <time dateTime={`P${Math.round(seconds)}S`} className={className || 'Vid-duration'}>
//       {formatDuration(seconds, frameRate)}
//     </time>
//   )
// }

// Duration.propTypes = {
//   seconds: PropTypes.number.isRequired,
//   frameRate: PropTypes.number.isRequired,
//   className: PropTypes.string
// }

