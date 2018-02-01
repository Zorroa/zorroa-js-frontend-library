import React, { PropTypes, PureComponent } from 'react'
import { Gauge } from '../Icons'
import classnames from 'classnames'

import VolumeBar from './VolumeBar'
import { PubSub } from '../../services/jsUtil'

export default class Controlbar extends PureComponent {
  static propTypes = {
    title: PropTypes.node,
    titleWidth: PropTypes.number,
    onZoomIn: PropTypes.func,
    onZoomOut: PropTypes.func,
    onFit: PropTypes.func,
    onNextPage: PropTypes.func,
    onPrevPage: PropTypes.func,
    onScrub: PropTypes.func,
    shuttler: PropTypes.instanceOf(PubSub),
    playing: PropTypes.bool,
    onVolume: PropTypes.func,
    currentFrameNumber: PropTypes.number,
    totalFrames: PropTypes.number,
    frameFrequency: PropTypes.shape({
      onFrameFrequency: PropTypes.func,
      options: PropTypes.arrayOf(PropTypes.number),
      rate: PropTypes.number
    }),
    volume: PropTypes.number
  }

  static defaultProps = {
    titleWidth: 0
  }

  constructor (props) {
    super(props)
    this.state = {
      showFpsOptions: false,
      scrubbedFrameNumber: props.currentFrameNumber
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.scrubbedFrameNumber !== nextProps.currentFrameNumber) {
      this.setState({
        scrubbedFrameNumber: nextProps.currentFrameNumber
      })
    }
  }

  showVideo () {
    return !!this.props.shuttler
  }

  showVolume () {
    return !!this.props.onVolume
  }

  showFrameFrequency () {
    return !!this.props.frameFrequency
  }

  showZoom () {
    return this.props.onZoomIn || this.props.onZoomOut || this.props.onFit
  }

  showScrubber () {
    const hasScrubHandler = typeof this.props.onScrub === 'function'
    const hasTotalFramesCount = Number.isInteger(this.props.totalFrames) === true
    const hasCurrentFrameNumber = Number.isInteger(this.props.currentFrameNumber) === true
    const hasShuttler = this.props.shuttler !== undefined
    return hasScrubHandler && hasTotalFramesCount && hasCurrentFrameNumber && hasShuttler
  }

  titleWidth () {
    return this.props.titleWidth || (this.props.title ? this.props.title.length * 10 : 0)
  }

  toggleShowFpsOptions = () => {
    document.removeEventListener('click', this.toggleShowFpsOptions)

    if (this.state.showFpsOptions === false) {
      document.addEventListener('click', this.toggleShowFpsOptions)
    }

    this.setState(prevState => {
      return {
        showFpsOptions: !prevState.showFpsOptions
      }
    })
  }

  getGaugeIntensity () {
    const frameFrequency = this.props.frameFrequency
    const index = frameFrequency.options.indexOf(frameFrequency.rate)

    if (index <= 0) {
      return 'low'
    }

    if (index === 1) {
      return 'medium'
    }

    return 'high'
  }

  setScrubbedFrameNumber = scrubbedFrameNumber => {
    this.setState({
      scrubbedFrameNumber
    })
  }

  scrub = () => {
    this.props.shuttler.publish('scrub', this.state.scrubbedFrameNumber)
  }

  onScrubSubmit = event => {
    event.preventDefault()
    this.scrub()
  }

  render () {
    return (
      <div className="Controlbar">
        <div className="Controlbar__inner">
        { this.showScrubber() && (
          <div className="Controlbar__section">
            <form onSubmit={this.onScrubSubmit} className="Controlbar__scrubber">
              Frame
              <input
                type="text"
                className="Controlbar__scrubber-input"
                value={this.state.scrubbedFrameNumber}
                onFocus={() => { this.props.shuttler.publish('stop') }}
                onChange={(event) => { this.setScrubbedFrameNumber(event.target.value) }}
                onBlur={this.scrub}
              />
              of {this.props.totalFrames}
            </form>
          </div>
        ) }
          { this.props.title && <div className="Controlbar__title">{this.props.title}</div> }
          { this.showVideo() && (
            <div className="Controlbar__section">
              <button onClick={e => this.props.shuttler.publish('rewind', e)} className="Controlbar__button icon-prev-clip"/>
              <button onClick={e => this.props.shuttler.publish('frameBack', e)} className="Controlbar__button icon-frame-back"/>
              <button
                onClick={e => this.props.shuttler.publish('startOrStop', e)}
                className={classnames('Controlbar__button', {
                  'icon-pause': this.props.playing === true,
                  'icon-play3': this.props.playing === false
                })}
              />
              <button onClick={e => this.props.shuttler.publish('frameForward', e)} className="Controlbar__button icon-frame-forward"/>
              <button onClick={e => this.props.shuttler.publish('fastForward', e)} className="Controlbar__button icon-next-clip"/>
            </div>
          )}
          { this.showFrameFrequency() && (
            <div className="Controlbar__section Controlbar__section-options">
              <button
                className="Controlbar__button"
                onClick={() => this.toggleShowFpsOptions()}
               >
               <Gauge color="#fff" intensity={this.getGaugeIntensity()} />
              </button>
              { this.state.showFpsOptions === true && (
                <ul className="Controlbar__options">
                  { this.props.frameFrequency.options.map(option => {
                    return (
                        <li key={option} className="Controlbar__options-items">
                          <button
                            onClick={() => this.props.frameFrequency.onFrameFrequency(option)}
                            className={classnames('Controlbar__options-button', {
                              'Controlbar__options-button--active': this.props.frameFrequency.rate === option
                            })}
                          >
                            {option} fps
                          </button>
                        </li>
                    )
                  }) }
                </ul>
              )}
            </div>
          ) }
          { this.showVolume() && (
            <div className="Controlbar__section">
              <VolumeBar volume={this.props.volume} onVolume={this.props.onVolume}/>
            </div>
          )}
          { this.showZoom() && (
              <div className="Controlbar__section">
                <button disabled={!this.props.onZoomOut} className="Controlbar__button Controlbar__zoom-out icon-zoom-out" onClick={this.props.onZoomOut} />
                <button disabled={!this.props.onFit} className="Controlbar__button Controlbar__zoom-reset icon-expand3" onClick={this.props.onFit} />
                <button disabled={!this.props.onZoomIn} className="Controlbar__button Controlbar__zoom-in icon-zoom-in" onClick={this.props.onZoomIn} />
              </div>
            ) }
        </div>
      </div>
    )
  }
}
