import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

// Reference: https://github.com/CookPete/react-player
import ReactPlayer from 'react-player'

import { setVideoVolume } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'
import { formatDuration } from '../../services/jsUtil'
import PanZoom from './PanZoom'
import User from '../../models/User'

class Video extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    startSec: PropTypes.number,
    stopSec: PropTypes.number,
    videoVolume: PropTypes.number,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      playing: true,
      volume: this.props.videoVolume,
      played: this.props.startSec,
      loaded: 0,
      duration: 0,
      startFraction: 0,
      stopFraction: 1,
      isClip: false
    }

    this.needToInit = true
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

  onSeekMouseDown = e => {
    this.setState({ seeking: true })
  }

  onSeekChange = e => {
    const t = parseFloat(e.target.value)
    this.scrub(t)
  }

  onSeekMouseUp = e => {
    this.setState({ seeking: false })
  }

  onProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)

      // Auto-stop when we run past the end of a clip
      if (this.state.isClip) {
        // console.log(`time left: ${(this.state.stopFraction - state.played) * this.state.duration} played:${state.played} start:${this.state.startFraction} stop:${this.state.stopFraction} dur:${this.state.duration}`)
        if (state.played > this.state.stopFraction) {
          // console.log('stop')
          this.setState({ playing: false })
          this.rewind()
        }
      }
    }
  }

  rewind = () => {
    this.scrub(this.state.startFraction)
  }

  fastForward = () => {
    this.scrub(this.state.stopFraction)
  }

  frameBack = () => {
    const t = Math.max(0, this.state.played - 1 / (30.0 * this.state.duration))
    this.scrub(t)
  }

  frameForward = () => {
    const t = Math.min(1, this.state.played + 1 / (30.0 * this.state.duration))
    this.scrub(t)
  }

  scrub (played) {
    this.setState({ played })
    this.player.seekTo(played)
  }

  setDuration = (duration) => {
    this.setState({ duration })
  }

  init = () => {
    if (!this.needToInit) return
    if (!this.player) return
    if (!this.state.duration) return

    this.needToInit = false

    const { duration } = this.state
    const startFraction = (this.props.startSec || 0) / duration
    const stopFraction = (this.props.stopSec || duration) / duration

    console.log(`video init start:${startFraction * duration} stop:${stopFraction * duration} clip:${(stopFraction - startFraction) * duration}`)

    if (startFraction > 0) {
      requestAnimationFrame(() => {
        this.setState({ startFraction, stopFraction, isClip: true })
        this.scrub(startFraction)
      })
    }
  }

  render () {
    const { url } = this.props
    const {
      playing, volume,
      played, loaded, duration
    } = this.state
    const volumeX = 130 * volume
    const volumeY = 30 - (5 + 20 * volume)

    if (this.needToInit) this.init()

    return (
      <div className='Video'>
        <div className="Video-pan-zoom">
          <PanZoom>
            <ReactPlayer
              ref={player => { this.player = player }}
              className='Video-player'
              url={url}
              width="100%"
              height="100%"
              playing={playing}
              volume={volume}
              onReady={() => console.log('onReady')}
              onStart={() => console.log('onStart')}
              onPlay={() => this.setState({ playing: true })}
              onPause={() => this.setState({ playing: false })}
              onBuffer={() => console.log('onBuffer')}
              onEnded={() => this.setState({ playing: false, played: 1 })}
              onError={e => console.log('onError', e)}
              onProgress={this.onProgress}
              progressFrequency={100}
              onDuration={this.setDuration}
            />
          </PanZoom>
        </div>
        <div className="Video-progress-bar">
          <input className="Video-scrub"
                 type='range' min={0} max={1} step='any'
                 value={played}
                 onMouseDown={this.onSeekMouseDown}
                 onInput={this.onSeekChange}
                 onMouseUp={this.onSeekMouseUp}
          />
          <svg className="Video-progress-progress" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect width={`${(loaded||0)*100}`} height="100" style={{fill: '#808080', stroke: 'none'}}></rect>
            <rect width={`${(played||0)*100}`} height="100" style={{fill: '#73b61c', stroke: 'none'}}></rect>
          </svg>
        </div>
        <div className="Video-control-bar">
          <div className="Video-time">
            <Duration className='Video-remaining' seconds={duration * played} />/<Duration seconds={duration}/>
          </div>
          <div className="Video-controls">
            <div onClick={this.rewind} className="icon-prev-clip"/>
            <div onClick={this.frameBack} className="icon-frame-back"/>
            <div onClick={this.playPause.bind(this)} className="Video-play">
              <div className={playing ? 'icon-pause' : 'icon-play3'} />
            </div>
            <div onClick={this.frameForward} className="icon-frame-forward"/>
            <div onClick={this.fastForward} className="icon-next-clip"/>
          </div>
          <div className="Video-misc">
            <div className="icon-mute"/>
            <div className="Video-volume">
              <div className="Video-volume-background">
                <svg width="100%" height="100%">
                  <path d="M0 25 L130 25 L130 5 Z" fill="#787a77" />
                  <path d={`M0 25 L${volumeX} 25 L${volumeX} ${volumeY} Z`} fill="#73b61c"/>
                </svg>
              </div>
              <input type='range' min={0} max={1} step='any' value={volume} onChange={this.setVolume} />
            </div>
            <div className="icon-volume-high"/>
            <button className="icon-expand" onClick={this.zoom} />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  videoVolume: state.app.videoVolume,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    setVideoVolume,
    saveUserSettings
  }, dispatch)
}))(Video)

const Duration = ({ className, seconds }) => {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={className || 'Video-duration'}>
      {formatDuration(seconds)}
    </time>
  )
}

Duration.propTypes = {
  seconds: PropTypes.number.isRequired,
  className: PropTypes.string
}

