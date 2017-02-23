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
import User from '../../models/User'

class Video extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    frames: PropTypes.number,
    frameRate: PropTypes.number,
    startFrame: PropTypes.number,
    stopFrame: PropTypes.number,
    videoVolume: PropTypes.number,
    onMultipage: PropTypes.func,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  state = {
    playing: true,
    volume: this.props.videoVolume,
    played: 0,
    loaded: 0
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
    const { startFrame, stopFrame } = this.props
    const v = parseFloat(e.target.value)
    const frame = startFrame + v * (stopFrame - startFrame)
    this.scrub(frame)
  }

  onSeekMouseUp = e => {
    this.setState({ seeking: false })
  }

  onProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
      const { stopFrame, frames } = this.props
      if (state.played >= stopFrame / frames) {
        this.setState({ playing: false })
        this.rewind()
      }
    }
  }

  rewind = () => {
    this.scrub(this.props.startFrame)
  }

  fastForward = () => {
    this.scrub(this.props.stopFrame)
  }

  frameBack = () => {
    const frame = Math.max(0, this.state.played * this.props.frames - 1)
    this.scrub(frame)
  }

  frameForward = () => {
    const frame = Math.min(this.state.played * this.props.frames + 1, this.props.stopFrame)
    this.scrub(frame)
  }

  scrub (frame) {
    const played = frame / this.props.frames
    this.setState({ played })
    this.player.seekTo(played)
  }

  clipTime (t) {
    const { frames, startFrame, stopFrame } = this.props
    return clamp((t * frames - startFrame) / (stopFrame - startFrame), 0, 1)
  }

  init () {
    const { url, startFrame } = this.props
    const initialized = `${url}@${startFrame}`
    if (this.initialized === initialized) return
    this.scrub(this.props.startFrame)
    this.initialized = initialized
  }

  render () {
    const { url, frameRate, frames, startFrame, stopFrame, onMultipage } = this.props
    const { playing, volume, played, loaded } = this.state
    const volumeX = 130 * volume
    const volumeY = 30 - (5 + 20 * volume)
    const seconds = played ? (played * frames - startFrame) / frameRate : 0
    const duration = (stopFrame - startFrame) / frameRate
    return (
      <div className='Video'>
        <div className="Video-pan-zoom">
          <PanZoom showControls={false} onMultipage={onMultipage}>
            <ReactPlayer
              ref={player => { this.player = player }}
              className='Video-player'
              url={url}
              width="100%"
              height="100%"
              playing={playing}
              volume={volume}
              onReady={() => this.init()}
              onStart={() => console.log('onStart')}
              onPlay={() => this.setState({ playing: true })}
              onPause={() => this.setState({ playing: false })}
              onBuffer={() => console.log('onBuffer')}
              onEnded={() => this.setState({ playing: false, played: 1 })}
              onError={e => console.log('onError', e)}
              onProgress={this.onProgress}
              progressFrequency={100}
            />
          </PanZoom>
        </div>
        <div className="Video-progress-bar">
          <input className="Video-scrub"
                 type='range' min={0} max={1} step='any'
                 value={this.clipTime(played)}
                 onMouseDown={this.onSeekMouseDown}
                 onInput={this.onSeekChange}
                 onMouseUp={this.onSeekMouseUp}
          />
          <svg className="Video-progress-progress" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect width={`${(this.clipTime(loaded) || 0) * 100}`} height="100" style={{fill: '#808080', stroke: 'none'}}></rect>
            <rect width={`${(this.clipTime(played) || 0) * 100}`} height="100" style={{fill: '#73b61c', stroke: 'none'}}></rect>
          </svg>
        </div>
        <div className="Video-control-bar">
          <div className="Video-time">
            <Duration className='Video-remaining' seconds={seconds} frameRate={frameRate} />/<Duration seconds={duration} frameRate={frameRate}/>
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
            <button className="Video-multipage icon-icons2" onClick={onMultipage} />
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

