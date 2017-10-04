import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

import { setVideoVolume } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { clamp, PubSub } from '../../services/jsUtil'
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
    actions: PropTypes.object,
    shuttler: PropTypes.instanceOf(PubSub).isRequired,
    status: PropTypes.instanceOf(PubSub).isRequired
  }

  static defaultProps = {
    frameRate: 30
  }

  constructor(props) {
    super(props)

    props.shuttler.on('start', this.start)
    props.shuttler.on('stop', this.stop)
    props.shuttler.on('startOrStop', this.startOrStop)
    props.shuttler.on('rewind', this.rewind)
    props.shuttler.on('fastForward', this.fastForward)
    props.shuttler.on('frameBack', this.frameBack)
    props.shuttler.on('frameForward', this.frameForward)
    props.shuttler.on('scrub', this.scrub)

    this.state = {
      playing: false,
      played: 0,
      lastPlayed: 0,
      startFrame: this.props.startFrame,
      stopFrame: this.props.stopFrame,
    }
  }

  resize = () => this.forceUpdate()

  componentDidMount () {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
  }

  onProgress = () => {
    if (!this.player) return
    const { frames, stopFrame, frameRate, status } = this.props
    const { playing } = this.state
    const lastPlayed = this.state.played
    const played = this.player.currentTime / (frames / frameRate)
    const stopPct = stopFrame / (frames - 1)
    if (played >= stopPct) {
      this.stop()
      this.setState({ played: stopPct, lastPlayed })
      status.publish('played', stopPct)
    } else {
      if (played !== lastPlayed) {
        this.setState({ played, lastPlayed })
        status.publish('played', played)
      }
    }
    if (playing) requestAnimationFrame(this.onProgress)
  }

  start = () => {
    const { frames, stopFrame, startFrame } = this.props
    if (this.state.played >= stopFrame / (frames - 1)) {
      this.scrub(this.state.startFrame)
    }
    this.setState({ playing: true }, this.onProgress)
    this.props.status.publish('playing', true)
    if (this.player) this.player.play()
    else this.stop()
  }

  stop = () => {
    this.setState({ playing: false })
    this.props.status.publish('playing', false)
    if (this.player) this.player.pause()
  }

  startOrStop = () => {
    if (this.state.playing) this.stop()
    else this.start()
  }

  rewind = () => {
    if (this.state.playing) this.stop()
    this.scrub(this.state.startFrame)
  }

  fastForward = () => {
    if (this.state.playing) this.stop()
    this.scrub(this.state.stopFrame)
  }

  frameBack = () => {
    if (this.state.playing) this.stop()
    const frame = Math.max(0, Math.floor(this.state.played * this.props.frames) - 1)
    this.scrub(frame)
  }

  frameForward = () => {
    if (this.state.playing) this.stop()
    const frame = Math.min(Math.floor(this.state.played * this.props.frames) + 1, this.props.frames - 1)
    this.scrub(frame)
  }

  scrub = (frame) => {
    const played = frame / (this.props.frames - 1)
    this.setState({ played })
    this.props.status.publish('played', played)
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

  init = () => {
    const { url, startFrame } = this.props
    const { volume } = this.state
    const initialized = `${url}@${startFrame}`
    if (this.initialized === initialized) return
    this.scrub(startFrame)
    this.start()
    this.initialized = initialized
  }

  render () {
    const { url, frameRate, frames, backgroundURL, onError } = this.props
    const { startFrame, stopFrame } = this.props
    const { videoVolume } = this.props

    const { playing, played  } = this.state
    const seconds = played ? (played * frames - startFrame) / frameRate : 0
    const total = frames * 10
    const exts = [ 'mp4', 'm4v', 'webm', 'ogv', 'ogg' ]

    if (this.player) this.player.volume = videoVolume

    return (
      <div className='Vid'>
        <video className="Vid-video"
               onCanPlay={this.init}
               autoPlay={playing}
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
  user: state.auth.user,
  userSettings: state.app.userSettings,
  videoVolume: state.app.videoVolume
}), dispatch => ({
  actions: bindActionCreators({
    setVideoVolume,
    saveUserSettings
  }, dispatch)
}))(Vid)

