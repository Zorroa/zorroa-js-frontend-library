import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { setVideoVolume } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { clamp, PubSub } from '../../services/jsUtil'
import User from '../../models/User'

/*

Video component w/ playback & status API

To control the video, pass a PubSub to props.shuttler, then publish commands to the PubSub
This component will subscribe to shuttle commands like 'start' and 'stop'
Here's the list of shuttle commands. (check constructor() & update comments, if these comments drift)
    start         - start playback
    stop          - stop (pause) playback
    startOrStop   - toggle playback, start if not playing, stop if already playing
    rewind        - go to the frame provided by props.startFrame
    fastForward   - go to the frame provided by props.stopFrame
    frameBack     - pause & step one frame backward (stops at startFrame)
    frameForward  - pause & step one frame forward (stops at stopFrame)
    scrub [frame] - go to specified [frame]

To get feedback on the video's status, pass a PubSub to props.status
This component will publish status commands like 'playing' and 'played'
  started - whether video playback has been requested. Video might be started but not playing yet. updated on start & stop.
  playing - whether video is actually playing. updated some time after start & after stop.
  played  - provides current frame number of video. updated every frame.

  playing:false and started:false events are not guaranteed if Video is unmounted while playing

*/

class Video extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    backgroundURL: PropTypes.string,
    children: PropTypes.arrayOf(React.PropTypes.element),
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

  constructor (props) {
    super(props)

    props.shuttler.on('load', this.load)
    props.shuttler.on('start', this.start)
    props.shuttler.on('stop', this.stop)
    props.shuttler.on('startOrStop', this.startOrStop)
    props.shuttler.on('rewind', this.rewind)
    props.shuttler.on('fastForward', this.fastForward)
    props.shuttler.on('frameBack', this.frameBack)
    props.shuttler.on('frameForward', this.frameForward)
    props.shuttler.on('scrub', this.scrub)

    this.state = {
      started: false,
      playing: false,
      played: 0,
      lastPlayed: 0
    }

    this.startQueued = false
    this.progressQueued = false
  }

  resize = () => this.forceUpdate()

  componentDidMount () {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
  }

  componentWillReceiveProps (nextProps) {
    // Force a video.load() after render of new video source
    if (!this._initialized) {
      this.player.load()
      this._queueStart()
    }
  }

  load = () => { this._initialized = false }

  // Make sure we only have one progress loop running at a time
  _queueProgress = () => {
    if (this.progressQueued) return
    this.onProgress()
  }

  onProgress = () => {
    this.progressQueued = false
    if (!this.player) return
    const { frames, stopFrame, frameRate, status } = this.props
    const { started } = this.state
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
    if (started) {
      this.progressQueued = true
      requestAnimationFrame(this.onProgress)
    }
  }

  // This will attempt to start the video.
  // If not ready, start a loop to poll until the video is ready, then start.
  // Make sure we only have one start-on-load loop.
  _queueStart = () => {
    if (this.startQueued) return
    this.startQueued = true
    requestAnimationFrame(this.start)
  }

  start = () => {
    const firstTimeStart = !this.startQueued
    this.startQueued = false
    if (!this.player) return
    const { frames, stopFrame, startFrame } = this.props

    if (firstTimeStart) {
      if (this.state.played >= stopFrame / (frames - 1)) {
        this.scrub(startFrame)
      }
      if (!this.state.started) {
        this.props.status.publish('started', true)
        this.setState({started: true}, this._queueProgress)
      }
    }

    // If the player isn't ready yet, then queue a start() call next frame. Repeat until ready
    if (this.player.readyState < 2) {
      this._queueStart()
    } else {
      this.props.status.publish('playing', true)
      this.setState({ playing: true })
      this.player.play()
    }
  }

  stop = () => {
    // TODO: queue the stop if we ever need to keep the video playing if
    // it's stopped before playback starts. Currently, this only happens
    // when this Video element unmounted after start() but before playback begins.

    // If player isnt' here, then component has been unmounted, ignore this
    if (!this.player) return

    // only send a matching 'playing' event
    if (this.state.playing) {
      this.setState({ playing: false })
      this.props.status.publish('playing', false)
    }

    // only send a matching 'started' event
    if (this.state.started) {
      this.setState({ started: false })
      this.props.status.publish('started', false)
    }

    // If the player hasn't started playing, then don't call pause()
    // Otherwise, we get a console error
    if (this.player.readyState >= 1) {
      this.player.pause()
    }
  }

  startOrStop = () => {
    if (this.state.started) this.stop()
    else this.start()
  }

  rewind = () => {
    if (this.state.started) this.stop()
    this.scrub(this.props.startFrame)
  }

  fastForward = () => {
    if (this.state.started) this.stop()
    this.scrub(this.props.stopFrame)
  }

  frameBack = () => {
    if (this.state.started) this.stop()
    const frame = Math.max(0, Math.floor(this.state.played * this.props.frames) - 1)
    this.scrub(frame)
  }

  frameForward = () => {
    if (this.state.started) this.stop()
    const frame = Math.min(Math.floor(this.state.played * this.props.frames) + 1, this.props.frames - 1)
    this.scrub(frame)
  }

  scrub = (frame) => {
    if (!this.player) return
    const { frames, stopFrame, frameRate, status } = this.props
    const played = frame / (frames - 1)
    if (played >= stopFrame / (frames - 1)) this.stop()
    this.setState({ played })
    status.publish('played', played)
    try {
      this.player.currentTime = played * frames / frameRate
    } catch (e) {
      console.log('Player isn\'t ready to seek: ' + e)
    }
  }

  clipTime (t) {
    const { frames, startFrame, stopFrame } = this.props
    return clamp((t * frames - startFrame) / (stopFrame - startFrame), 0, 1)
  }

  init = () => {
    if (this._initialized) return
    this.scrub(this.props.startFrame)
    this.start()
    this._initialized = true
  }

  render () {
    const { url, onError, videoVolume } = this.props
    const { started } = this.state
    const exts = [ 'mp4', 'm4v', 'webm', 'ogv', 'ogg' ]
    const svg = require('../Inspector/loading-ring.svg')

    if (this.player) this.player.volume = videoVolume

    return (
      <div className='Video'>
        <video className="Video-video"
               onCanPlay={this.init}
               autoPlay={started}
               onEnded={ this.stop }
               onError={e => onError && onError(e.target.error)}
               width="100%" height="100%"
               ref={player => { this.player = player }}>
          { exts.map(ext => <source key={ext} src={`${url}?ext=${ext}`} type={`video/${ext}`}/>) }
          <source key="raw" src={url}/>
        </video>
        { (!this.player || this.player.readyState < 1) && <img className="Video-loading" src={svg}/> }
        { this.props.children }
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
}))(Video)

