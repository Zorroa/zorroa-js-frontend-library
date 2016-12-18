import React, { Component, PropTypes } from 'react'
import keydown from 'react-keydown'

// Reference: https://github.com/CookPete/react-player
import ReactPlayer from 'react-player'

import { formatDuration } from '../../services/jsUtil'
import PanZoom from './PanZoom'

export default class Video extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired
  }

  state = {
    playing: true,
    volume: 0.8,
    played: 0,
    loaded: 0,
    duration: 0
  }

  @keydown('space')
  playPause () {
    this.setState({ playing: !this.state.playing })
  }

  setVolume = e => {
    this.setState({ volume: parseFloat(e.target.value) })
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
    }
  }

  rewind = () => {
    this.scrub(0)
  }

  fastForward = () => {
    this.scrub(1)
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

  render () {
    const { url } = this.props
    const {
      playing, volume,
      played, loaded, duration
    } = this.state
    const volumeX = 130 * volume
    const volumeY = 30 - (5 + 20 * volume)
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
              onDuration={duration => this.setState({ duration })}
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
          <progress className="loaded" max={1} value={loaded} />
          <progress className="played" max={1} value={played} />
        </div>
        <div className="Video-control-bar">
          <div className="Video-time">
            <Duration seconds={duration * played} />/<Duration seconds={duration}/>
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

const Duration = ({ className, seconds }) => {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={'Video-duration' || className}>
      {formatDuration(seconds)}
    </time>
  )
}

Duration.propTypes = {
  seconds: PropTypes.number.isRequired,
  className: PropTypes.string
}

