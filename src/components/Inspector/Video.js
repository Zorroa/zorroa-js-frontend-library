import React, { Component, PropTypes } from 'react'

// Reference: https://github.com/CookPete/react-player
import ReactPlayer from 'react-player'

import { formatDuration } from '../../services/jsUtil'

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

  playPause = () => {
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
    const { duration } = this.state
    this.scrub(duration)
  }

  frameBack = () => {
    const t = this.state.played - 1 / (30.0 * this.state.duration)
    this.scrub(t)
  }

  frameForward = () => {
    const t = this.state.played + 1 / (30.0 * this.state.duration)
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

    return (
      <div className='Video'>
        <ReactPlayer
          ref={player => { this.player = player }}
          className='player'
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
          onEnded={() => this.setState({ playing: false })}
          onError={e => console.log('onError', e)}
          onProgress={this.onProgress}
          onDuration={duration => this.setState({ duration })}
        />
        <div className="progress-bar">
          <input className="scrub"
                 type='range' min={0} max={1} step='any'
                 value={played}
                 onMouseDown={this.onSeekMouseDown}
                 onInput={this.onSeekChange}
                 onMouseUp={this.onSeekMouseUp}
          />
          <progress className="loaded" max={1} value={loaded} />
          <progress className="played" max={1} value={played} />
        </div>
        <div className="control-bar">
          <div className="time">
            <Duration seconds={duration * played} />/<Duration seconds={duration}/>
          </div>
          <div className="controls">
            <div onClick={this.rewind} className="icon-fast-rewind">&lt;&lt;</div>
            <div onClick={this.frameBack} className="icon-frame-back">&lt;</div>
            <div onClick={this.playPause}>{playing ? 'Pause' : 'Play'}</div>
            <div onClick={this.frameForward} className="icon-frame-forward">&gt;</div>
            <div onClick={this.fastForward} className="icon-fast-foward">&gt;&gt;</div>
          </div>
          <div className="misc">
            <input type='range' min={0} max={1} step='any' value={volume} onChange={this.setVolume} />
            <button className="icon-cross2" onClick={this.zoom} />
          </div>
        </div>
      </div>
    )
  }
}

const Duration = ({ className, seconds }) => {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={'duration' || className}>
      {formatDuration(seconds)}
    </time>
  )
}

Duration.propTypes = {
  seconds: PropTypes.number.isRequired,
  className: PropTypes.string
}

