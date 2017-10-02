import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Resizer from '../../services/Resizer'
import { TimeAxis } from 'react-axis'

export default class VideoRange extends Component {
  static propTypes = {
    played: PropTypes.number.isRequired,
    frames: PropTypes.number.isRequired,
    frameRate: PropTypes.number.isRequired,
    startFrame: PropTypes.number.isRequired,
    stopFrame: PropTypes.number.isRequired,
    clipStartFrame: PropTypes.number.isRequired,
    clipStopFrame: PropTypes.number.isRequired,
    onScrub: PropTypes.func.isRequired,
    onRange: PropTypes.func.isRequired,
    onClipRange: PropTypes.func.isRequired,
    backgroundURL: PropTypes.string
  }

  resizer = null

  componentWillMount = () => {
    this.resizer = new Resizer()
  }

  componentWillUnmount = () => {
    this.resizer.release()
  }

  resizeStart = (update, event) => {
    this.resizer.capture(
      update,                 /* onMove    */
      null,                   /* onRelease */
      event.clientX,          /* startX    */
      0,                      /* startY    */
      1,                      /* optScaleX */
      0)                      /* optScaleY */
    update(event.clientX)
    event.preventDefault()
    event.stopPropagation()
  }

  frameAtX = (x) => {
    const { frames, clipStartFrame, clipStopFrame } = this.props
    const clipWidth = this.refs.clip && this.refs.clip.clientWidth || 1
    const clipFrames = clipStopFrame - clipStartFrame + 1
    return Math.max(0, Math.min(frames - 1, clipStartFrame + clipFrames * (x - 8) / clipWidth))
  }

  resizeUpdate = (x) => {
    this.props.onScrub(this.frameAtX(x))
  }

  resizeLeft = (x) => {
    const frame = Math.min(this.frameAtX(x), this.props.stopFrame)
    this.props.onRange(frame, this.props.stopFrame)
  }

  resizeRight = (x) => {
    const frame = Math.max(this.frameAtX(x), this.props.startFrame)
    this.props.onRange(this.props.startFrame, frame)
  }

  resizeClip = (frame) => {
    this.props.onClipRange(frame, frame + (this.props.clipStopFrame - this.props.clipStartFrame))
  }

  resizeClipLeft = (frame) => {
    this.props.onClipRange(frame, this.props.clipStopFrame)
  }

  resizeClipRight = (frame) => {
    this.props.onClipRange(this.props.clipStartFrame, frame)
  }

  render () {
    const { played, frames, frameRate, backgroundURL, startFrame, stopFrame, clipStartFrame, clipStopFrame } = this.props
    if (!frames) return
    const clipWidth = this.refs.clip && this.refs.clip.clientWidth || 0
    const clipHeight = this.refs.clip && this.refs.clip.clientHeight || 0
    const clipFrames = clipStopFrame - clipStartFrame + 1
    const clipLeftPx = clipWidth * (startFrame - clipStartFrame) / clipFrames
    const clipRightPx = clipWidth * (stopFrame - clipStartFrame) / clipFrames
    const clipWidthPx = Math.max(10, clipRightPx - clipLeftPx)
    const barLeftPx = clipWidth * clipStartFrame / (frames - 1)
    const barRightPx = clipWidth * clipStopFrame / (frames - 1)
    const barWidthPx = Math.max(5, barRightPx - barLeftPx)
    const barClipLeftPx = clipWidth * startFrame / (frames - 1)
    const barClipRightPx = clipWidth * stopFrame / (frames - 1)
    const playhead = `${clipWidth * (played * frames - clipStartFrame) / clipFrames - 4}px`
    const scrubbing = this.resizer.active
    const clipScale = clipWidth * frames / clipFrames
    const clipOffset = -clipScale * clipStartFrame / (frames - 1)
    const barBackground = backgroundURL ? { backgroundSize: `${clipWidth}px ${clipHeight}px`, backgroundImage: `url(${backgroundURL})` } : {}
    const clipBackground = backgroundURL ? { backgroundSize: `${clipScale}px ${clipHeight}px`, backgroundPosition: `${clipOffset}px 0`, backgroundImage: `url(${backgroundURL})` } : {}
    const clipStartTime = new Date(1000 * clipStartFrame / frameRate)
    const clipStopTime = new Date(1000 * clipStopFrame / frameRate)
    const startTime = new Date(0)
    const stopTime = new Date(1000 * frames / frameRate)
    const tickCount = Math.min(10, Math.max(3, Math.round(clipWidth / 100)))
    return (
      <div className="VideoRange">
        <div className="VideoRange-clip" ref='clip' onMouseDown={e => this.resizeStart(this.resizeUpdate, e)} style={clipBackground}>
          { clipWidth && (
            <div className="VideoRange-clip-range" style={{ marginLeft: `${clipLeftPx}px`, width: `${clipWidthPx}px` }}>
              <div className="VideoRange-clip-range-left" onMouseDown={e => this.resizeStart(this.resizeLeft, e)}/>
              <div className="VideoRange-clip-range-middle"/>
              <div className="VideoRange-clip-range-right" onMouseDown={e => this.resizeStart(this.resizeRight, e)}/>
            </div>
          )}
          { clipWidth && <div className={classnames('VideoRange-clip-playhead', {scrubbing})} style={{ left: playhead }}/> }
          { clipWidth && clipFrames > frameRate * tickCount && (
            <div className="VideoRange-axis">
              <TimeAxis format="duration" position="bottom" width={clipWidth} height={clipHeight} margin={0}
                        beginTime={clipStartTime} endTime={clipStopTime} tickCount={tickCount} standalone={true} />
            </div>
          )}
        </div>
        { clipWidth && clipFrames !== frames && (
          <div className="VideoRange-movie">
            <div className="VideoRange-movie-background" style={barBackground}/>
            <div className="VideoRange-bar-clip" style={{ left: barClipLeftPx, width: barClipRightPx - barClipLeftPx }} />
            <div className="VideoRange-axis">
              <TimeAxis format="duration" position="top" width={clipWidth} height={clipHeight} margin={0}
                        beginTime={startTime} endTime={stopTime} tickCount={tickCount} standalone={true} />
            </div>
            <div className="VideoRange-bar-range" style={{ marginLeft: `${barLeftPx}px`, width: `${barWidthPx}px` }}>
              <div className="VideoRange-bar-range-left" onMouseDown={_ => { this.resizer.capture(this.resizeClipLeft, null, this.props.clipStartFrame, 0, this.props.frames / clipWidth, 0) }}/>
              <div className="VideoRange-bar-range-middle" onMouseDown={_ => { this.resizer.capture(this.resizeClip, null, this.props.clipStartFrame, 0, this.props.frames / clipWidth, 0) }}/>
              <div className="VideoRange-bar-range-right" onMouseDown={_ => { this.resizer.capture(this.resizeClipRight, null, this.props.clipStopFrame, 0, this.props.frames / clipWidth, 0) }}/>
            </div>
            <div className="VideoRange-movie-thumb" style={{ left: `${clipWidth * played}px` }}>
              <div className="VideoRange-movie-thumb-marker"/>
            </div>
          </div>
        )}
      </div>
    )
  }
}
